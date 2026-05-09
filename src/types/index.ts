export interface EcoObject {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'donation' | 'sale';
  price?: number;
  image: string;
  location: string;
  timeAgo: string;
  seller: { name: string };
}
