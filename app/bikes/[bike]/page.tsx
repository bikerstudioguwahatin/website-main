// File: app/bikes/[bike]/page.tsx

import { getBikeWithProducts } from '@/lib/actions';
import { notFound } from 'next/navigation';
import BikeProductsClient from '@/components/BikeProductsClient';

interface PageProps {
  params: Promise<{ bike: string }>;
}

export default async function BikeProductsPage({ params }: PageProps) {
  const { bike: bikeSlug } = await params;
  const bike = await getBikeWithProducts(bikeSlug);

  if (!bike) {
    return notFound();
  }

  const products = bike.products ?? [];

  return (
    <BikeProductsClient 
      bike={{
        name: bike.name,
        brandName: bike.brand.name,
        description: bike.description,
      }}
      products={products}
    />
  );
}