import React from "react";
import {
  ShopOutlined,
  RestOutlined,
  TeamOutlined,
  CalendarOutlined,
  BlockOutlined,
  DollarOutlined,
} from "@ant-design/icons";

export const plans = [
  {
    name: "Starter",
    desc: "For single outlet getting started",
    monthlyPrice: "₹1,999",
    yearlyPrice: "₹19,990",
    color: "#52c41a",
    features: [
      "1 Outlet",
      "POS billing + receipts",
      "Inventory basics + low stock alerts",
      "Attendance + leave",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Starter",
    popular: false,
  },
  {
    name: "Growth",
    desc: "For growing teams and multiple modules",
    monthlyPrice: "₹3,999",
    yearlyPrice: "₹39,990",
    color: "#5838ff",
    features: [
      "Up to 3 Outlets",
      "POS + discounts + split bills",
      "Inventory + purchase requests",
      "Tasks/SOP + completion tracking",
      "Expenses + reports",
      "Priority support",
    ],
    cta: "Choose Growth",
    popular: true,
  },
  {
    name: "Pro",
    desc: "For multi-outlet operations and deeper control",
    monthlyPrice: "₹6,999",
    yearlyPrice: "₹69,990",
    color: "#f7931a",
    features: [
      "Up to 10 Outlets",
      "Kitchen display + waiter flows",
      "Advanced analytics + outlet comparison",
      "Salary management",
      "Activity logs",
      "Dedicated onboarding",
    ],
    cta: "Go Pro",
    popular: false,
  },
];

export const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Owner, Spice Garden",
    text: "OutletOps completely transformed how we manage our 3 branches. The POS + kitchen display combo alone saved us ₹40k/month in wasted orders.",
    stars: 5,
  },
  {
    name: "Priya Mehta",
    role: "Manager, Café Bloom",
    text: "Staff attendance, tasks, and salary — all in one place. I used to spend hours on spreadsheets. Now it's 5 minutes a day.",
    stars: 5,
  },
  {
    name: "Anil Verma",
    role: "Director, QuickBite Chain",
    text: "The SOP module is underrated. Training new staff is 3x faster because everything is documented and trackable.",
    stars: 5,
  },
];

export const modules = [
  {
    icon: <ShopOutlined />,
    color: "#5838ff",
    title: "POS Billing & Order Terminal",
    description:
      "A lightning-fast point-of-sale terminal designed for busy restaurants and retail. Handle dine-in, takeaway, and delivery with split bills, discounts, and real-time printing — all from one screen.",
    screenshot: "/screenshots/ss_waiter.png",
    bullets: [
      "Table-based ordering with live floor map",
      "Split bills, custom discounts, and item modifiers",
      "Instant KOT printing to kitchen printers",
      "Support for multiple payment modes",
    ],
  },
  {
    icon: <RestOutlined />,
    color: "#f7931a",
    title: "Menu & Kitchen Management",
    description:
      "Design your menu with images, categories, and pricing. The live Kitchen Display System (KDS) keeps your kitchen team in sync with orders the moment they are placed.",
    screenshot: "/screenshots/ss_menu.png",
    bullets: [
      "Rich menu cards with images, prep times, and tags",
      "Live kitchen display ordered by priority",
      "Toggle item availability in real time",
      "Category-wise filtering for fast navigation",
    ],
    reverse: true,
  },
  {
    icon: <TeamOutlined />,
    color: "#13c2c2",
    title: "Staff & Employee Management",
    description:
      "Manage your entire team from one place — from onboarding to role assignment. Role-based access ensures every staff member only sees what they need.",
    screenshot: "/screenshots/ss_employees.png",
    bullets: [
      "Add employees with salary, role, and contact details",
      "Role-based module access (POS, HRM, Admin, etc.)",
      "See all active staff across all outlets",
      "Quick employee profile view and edit",
    ],
  },
  {
    icon: <CalendarOutlined />,
    color: "#eb2f96",
    title: "Attendance & Leave Tracking",
    description:
      "Replace paper registers with a digital attendance system. Track daily check-ins, breaks, and working hours with monthly views and automated summaries.",
    screenshot: "/screenshots/ss_attendance.png",
    bullets: [
      "Mark check-in/check-out for any employee",
      "Daily and monthly attendance views",
      "Track Present, Absent, Late, On Leave status",
      "Export attendance data for payroll",
    ],
    reverse: true,
  },
  {
    icon: <BlockOutlined />,
    color: "#52c41a",
    title: "Tasks & SOP Management",
    description:
      "Create tasks, assign them to team members, and track completion with priorities and deadlines. Standard Operating Procedures ensure consistency across every shift.",
    screenshot: "/screenshots/ss_tasks.png",
    bullets: [
      "Create tasks with priority, deadline & assignee",
      "Track status: Pending → In Progress → Completed",
      "SOP library with step-by-step instructions",
      "Attach categories and difficulty levels to SOPs",
    ],
  },
  {
    icon: <DollarOutlined />,
    color: "#fa8c16",
    title: "Salary & Payroll Processing",
    description:
      "View a complete employee salary summary, process monthly payroll, and track advance payments — all from a single payroll dashboard.",
    screenshot: "/screenshots/ss_salary.png",
    bullets: [
      "Monthly payroll dashboard per organization",
      "Track base salary, advances, and remaining payable",
      "Process payroll with one click",
      "Per-employee payslip view",
    ],
    reverse: true,
  },
];

export const faqItems = [
  {
    key: "1",
    label: "Is OutletOps subscription-based?",
    children:
      "Yes — choose Monthly or Yearly plans. Yearly plans are discounted by ~17%. You can also use Pay-as-you-go for flexible outlets.",
  },
  {
    key: "2",
    label: "Does it support restaurants (waiter + kitchen)?",
    children:
      "Yes. The Waiter View shows a live floor map, Table & Orders view, and allows waiters to take orders. The Kitchen Display shows live KOT tickets for kitchen staff.",
  },
  {
    key: "3",
    label: "Can I control staff access by role?",
    children:
      "Absolutely. Every employee is assigned a role (Admin, Manager, Cashier, Waiter, Kitchen, Cleaner, etc.) and each role only has access to the modules it needs.",
  },
  {
    key: "4",
    label: "Can I manage multiple outlets from one account?",
    children:
      "Yes. OutletOps is built for multi-outlet businesses. You can manage employees, POS, tasks, and reports across all outlets from a single admin dashboard.",
  },
  {
    key: "5",
    label: "Is my data secure?",
    children:
      "All data is stored in a secured MongoDB cloud database. Access is protected by JWT-based authentication. Role-based permissions ensure data isolation between team members.",
  },
  {
    key: "6",
    label: "What happens if I switch plans?",
    children:
      "You can upgrade or downgrade any time. Your data is fully preserved. Changes take effect from your next billing cycle.",
  },
];
