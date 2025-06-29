export type TableStatus = 'available' | 'occupied' | 'billing';

export interface Table {
  id: number;
  status: TableStatus;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItem {
  id: number;
  name:string;
  price: number;
  categoryId: string;
  image: string;
  hint: string;
}

export const tables: Table[] = [
  { id: 1, status: 'occupied' },
  { id: 2, status: 'available' },
  { id: 3, status: 'available' },
  { id: 4, status: 'billing' },
  { id: 5, status: 'available' },
  { id: 6, status: 'occupied' },
  { id: 7, status: 'available' },
  { id: 8, status: 'available' },
  { id: 9, status: 'billing' },
  { id: 10, status: 'available' },
  { id: 11, status: 'occupied' },
  { id: 12, status: 'available' },
];

export const menuCategories: MenuCategory[] = [
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'main-courses', name: 'Main Courses' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'beverages', name: 'Beverages' },
];

export const menuItems: MenuItem[] = [
  { id: 1, name: 'Bruschetta', price: 8.50, categoryId: 'appetizers', image: 'https://placehold.co/300x200.png', hint: 'bruschetta food' },
  { id: 2, name: 'Caprese Salad', price: 10.00, categoryId: 'appetizers', image: 'https://placehold.co/300x200.png', hint: 'caprese salad' },
  { id: 3, name: 'Garlic Bread', price: 6.00, categoryId: 'appetizers', image: 'https://placehold.co/300x200.png', hint: 'garlic bread' },
  { id: 4, name: 'Spaghetti Carbonara', price: 15.00, categoryId: 'main-courses', image: 'https://placehold.co/300x200.png', hint: 'spaghetti carbonara' },
  { id: 5, name: 'Margherita Pizza', price: 14.00, categoryId: 'main-courses', image: 'https://placehold.co/300x200.png', hint: 'pizza food' },
  { id: 6, name: 'Grilled Salmon', price: 22.00, categoryId: 'main-courses', image: 'https://placehold.co/300x200.png', hint: 'grilled salmon' },
  { id: 7, name: 'Chicken Parmesan', price: 18.00, categoryId: 'main-courses', image: 'https://placehold.co/300x200.png', hint: 'chicken parmesan' },
  { id: 8, name: 'Lasagna', price: 16.50, categoryId: 'main-courses', image: 'https://placehold.co/300x200.png', hint: 'lasagna food' },
  { id: 9, name: 'Tiramisu', price: 9.00, categoryId: 'desserts', image: 'https://placehold.co/300x200.png', hint: 'tiramisu dessert' },
  { id: 10, name: 'Cheesecake', price: 8.00, categoryId: 'desserts', image: 'https://placehold.co/300x200.png', hint: 'cheesecake dessert' },
  { id: 11, name: 'Chocolate Lava Cake', price: 9.50, categoryId: 'desserts', image: 'https://placehold.co/300x200.png', hint: 'chocolate cake' },
  { id: 12, name: 'Mineral Water', price: 3.00, categoryId: 'beverages', image: 'https://placehold.co/300x200.png', hint: 'water bottle' },
  { id: 13, name: 'Orange Juice', price: 4.50, categoryId: 'beverages', image: 'https://placehold.co/300x200.png', hint: 'orange juice' },
  { id: 14, name: 'Espresso', price: 3.50, categoryId: 'beverages', image: 'https://placehold.co/300x200.png', hint: 'espresso coffee' },
  { id: 15, name: 'House Wine (Red)', price: 7.00, categoryId: 'beverages', image: 'https://placehold.co/300x200.png', hint: 'red wine' },
];
