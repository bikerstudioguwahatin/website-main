// admin/views/DashboardView.tsx

"use client"
import React from 'react';
import { Package, CreditCard, Users, BarChart3, AlertCircle } from 'lucide-react';
import { DashboardStats } from '../types';
import { STAT_COLORS } from '../constants';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  color: keyof typeof STAT_COLORS;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1 text-black">{value}</p>
        </div>
        <div className={`w-12 h-12 ${STAT_COLORS[color]} rounded-lg flex items-center justify-center text-white`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

interface DashboardViewProps {
  stats: DashboardStats;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats }) => (
  <div className="space-y-6 ">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="blue" />
      <StatCard title="Total Orders" value={stats.totalOrders} icon={CreditCard} color="green" />
      <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="purple" />
      <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={BarChart3} color="yellow" />
      <StatCard title="Pending Orders" value={stats.pendingOrders} icon={AlertCircle} color="orange" />
      <StatCard title="Low Stock Items" value={stats.lowStock} icon={Package} color="red" />
    </div>
  </div>
);