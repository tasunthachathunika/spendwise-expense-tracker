import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Fuel,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Home,
  Zap,
  Plane,
  Dumbbell,
  Briefcase,
  Laptop,
  TrendingUp,
  Building2,
  Gift,
  Tv,
  Award,
  CircleDollarSign,
} from 'lucide-react';

const ICON_MAP = {
  Food: Utensils,
  Groceries: ShoppingCart,
  Transport: Car,
  Fuel: Fuel,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Health: HeartPulse,
  Medical: HeartPulse,
  Education: GraduationCap,
  Rent: Home,
  Housing: Home,
  Utilities: Zap,
  Travel: Plane,
  Gym: Dumbbell,
  Salary: Briefcase,
  Freelance: Laptop,
  Investment: TrendingUp,
  Business: Building2,
  Gift: Gift,
  Subscriptions: Tv,
  Bonus: Award,
  'Rental Income': Home,
};

const CategoryIcon = ({ category = '', size = 16, className = '' }) => {
  const IconComponent = ICON_MAP[category] || CircleDollarSign;
  return <IconComponent size={size} className={className} aria-hidden="true" />;
};

export default CategoryIcon;
