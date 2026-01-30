// =======================================================================
// app/api/user/addresses/[id]/set-default/route.ts
// =======================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Unset all other default addresses for this user
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json({
      success: true,
      address: updatedAddress,
    });
  } catch (error: any) {
    console.error('Error setting default address:', error);
    return NextResponse.json(
      { error: 'Failed to set default address', details: error.message },
      { status: 500 }
    );
  }
}