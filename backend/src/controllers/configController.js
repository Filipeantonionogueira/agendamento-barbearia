import { configService } from "../services/configService.js";
import { siteContentService } from "../services/siteContentService.js";
import { auditService } from "../services/auditService.js";

function toPublicShape(config) {
  return {
    shopName: config.shopName,
    whatsappNumber: config.whatsappNumber,
    heroImageUrl: config.heroImageUrl,
    aboutText: config.aboutText,
    addressLine: config.addressLine,
    openingHoursText: config.openingHoursText
  };
}

export const configController = {
  // Uma unica chamada publica entrega tudo que a landing precisa para renderizar.
  async getPublic(_req, res, next) {
    try {
      const [config, content] = await Promise.all([configService.get(), siteContentService.get()]);
      res.json({ ...toPublicShape(config), content });
    } catch (error) {
      next(error);
    }
  },
  async get(_req, res, next) {
    try {
      const [config, content] = await Promise.all([configService.get(), siteContentService.get()]);
      res.json({ ...toPublicShape(config), content });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const result = toPublicShape(await configService.update(req.body));
      auditService.record({ action: "CONFIG_UPDATED", entity: "Barber", req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  // CMS: conteudo editavel da landing (hero, textos, FAQ, Instagram, ordem das secoes).
  async getContent(_req, res, next) {
    try {
      res.json(await siteContentService.get());
    } catch (error) {
      next(error);
    }
  },
  async updateContent(req, res, next) {
    try {
      const result = await siteContentService.update(req.body);
      auditService.record({ action: "SITE_CONTENT_UPDATED", entity: "SiteContent", req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
