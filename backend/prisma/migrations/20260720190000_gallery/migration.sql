CREATE TABLE "GalleryItem" (
  "id" TEXT NOT NULL,
  "barbeiro_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT,
  "category" TEXT NOT NULL DEFAULT 'GERAL',
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GalleryItem_barbeiro_id_active_display_order_idx" ON "GalleryItem"("barbeiro_id", "active", "display_order");
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
