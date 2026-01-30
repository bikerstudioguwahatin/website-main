// app/api/user/addresses/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE address
export async function DELETE(
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

    // Delete address
    await prisma.address.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE address
export async function PUT(
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
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const {
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = await request.json();

    // Validation
    if (!fullName?.trim() || !phone?.trim() || !street?.trim() || 
        !city?.trim() || !state?.trim() || !pincode?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: params.id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update address
    const address = await prisma.address.update({
      where: { id: params.id },
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country?.trim() || 'India',
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address', details: error.message },
      { status: 500 }
    );
  }
}

