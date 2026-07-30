import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const lgpdService = {
  // Direito de acesso/portabilidade: retorna todos os dados pessoais do titular.
  async exportData(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        favorites: { include: { service: true, professional: true } },
        reviews: true,
        notifications: true,
        waitlist: true,
        client: {
          include: { appointments: { include: { appointmentServices: { include: { service: true } }, professional: true } } }
        }
      }
    });
    if (!user) throw new AppError("Usuario nao encontrado.", 404);

    return {
      geradoEm: new Date().toISOString(),
      perfil: {
        id: user.id,
        nome: user.name,
        email: user.email,
        telefone: user.phone,
        fotoUrl: user.photoUrl,
        papeis: user.roles.map((r) => r.role),
        criadoEm: user.createdAt
      },
      agendamentos: (user.client?.appointments || []).map((a) => ({
        data: a.startAt,
        status: a.status,
        profissional: a.professional?.name,
        servicos: a.appointmentServices.map((s) => s.service.name),
        valorCentavos: a.totalPriceCents,
        observacoes: a.notes
      })),
      avaliacoes: user.reviews.map((r) => ({ nota: r.rating, comentario: r.comment, resposta: r.reply, data: r.createdAt })),
      favoritos: user.favorites.map((f) => ({ servico: f.service?.name, profissional: f.professional?.name })),
      notificacoes: user.notifications.map((n) => ({ titulo: n.title, corpo: n.body, data: n.createdAt })),
      listaDeEspera: user.waitlist.map((w) => ({ data: w.date, status: w.status }))
    };
  },

  // Direito de exclusao: anonimiza o titular, preservando registros de negocio (retencao legal).
  async deleteAccount(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
    if (!user) throw new AppError("Usuario nao encontrado.", 404);
    if (user.roles.some((r) => ["OWNER", "ADMIN"].includes(r.role))) {
      throw new AppError("Contas administrativas nao podem ser excluidas por aqui.", 403);
    }

    await prisma.$transaction(async (tx) => {
      // Remove dados puramente pessoais (sem valor de retencao).
      await tx.favorite.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.waitlistEntry.deleteMany({ where: { userId } });
      await tx.passwordResetToken.deleteMany({ where: { userId } });
      await tx.refreshToken.deleteMany({ where: { userId } });

      // Anonimiza o registro de cliente (mantem historico de agendamentos sem PII).
      await tx.client.updateMany({ where: { userId }, data: { name: "Cliente removido", phone: null } });

      // Anonimiza o usuario e desativa a conta (impede novo login).
      await tx.user.update({
        where: { id: userId },
        data: {
          name: "Conta removida",
          email: `removido+${userId}@lgpd.local`,
          phone: null,
          photoUrl: null,
          passwordHash: null,
          active: false,
          deletedAt: new Date()
        }
      });
    });

    logger.info("account_deleted_lgpd", { userId });
    return { ok: true };
  }
};
