import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ১. নতুন মেডিসিন তৈরি
export const createMedicine = async (data: any, sellerId: string) => {
  return await prisma.medicine.create({
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      stock: parseInt(data.stock) || 0,
      manufacturer: data.manufacturer,
      categoryId: data.categoryId,
      sellerId: sellerId // Middleware থেকে আসা আইডি
    }
  });
};

// ২. সব মেডিসিন আনা (ফিল্টারিং ও প্যাজিনেশনসহ)
export const getAllMedicines = async (query: any) => {
  const { search, category, sortBy, sortOrder, page, limit } = query;
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const skip = (p - 1) * l;

  const where = {
    name: search ? { contains: String(search), mode: 'insensitive' as const } : undefined,
    category: category ? { name: String(category) } : undefined,
  };

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      include: { 
        category: true, 
        seller: { select: { id: true, name: true, email: true, role: true } } 
      },
      orderBy: sortBy ? { [String(sortBy)]: sortOrder === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' },
      skip,
      take: l,
    }),
    prisma.medicine.count({ where })
  ]);

  return {
    meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    data: medicines
  };
};

// ৩. মেডিসিন আপডেট (সিকিউরড: শুধুমাত্র নির্দিষ্ট ফিল্ড আপডেট হবে)
export const updateMedicine = async (id: string, updateData: any) => {
  const { name, description, price, stock, manufacturer, categoryId } = updateData;
  
  return await prisma.medicine.update({
    where: { id },
    data: { 
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(manufacturer && { manufacturer }),
      ...(categoryId && { categoryId }),
    }
  });
};

// ৪. মেডিসিন ডিলিট
export const deleteMedicine = async (id: string) => {
  return await prisma.medicine.delete({ where: { id } });
};