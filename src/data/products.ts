export type SizeOption = '10ml' | '15ml' | '50ml' | '85ml';
export type ConcentrationOption = 'EDP' | 'Extrait';
export type ProductVariant = {
  concentration: ConcentrationOption;
  prices: Record<SizeOption, number>;
};
export type Product = {
  id: string;
  name: string;
  family: string;
  notes: string[];
  price: number;
  size: string;
  image: string;
  gallery?: string[];
  image_gallery?: string[];
  gallery_images?: string[];
  rating: number;
  reviews: number;
  stock: number;
  tag: string;
  description: string;
  category?: 'perfumes' | 'cosmetics' | 'wellness' | string;
  variants: ProductVariant[];
  hero_enabled?: boolean;
  hero_badge?: string;
  hero_title?: string;
  hero_description?: string;
  hero_button_text?: string;
  hero_button_link?: string;
  hero_order?: number;
};

export const sizes: SizeOption[] = ['10ml', '15ml', '50ml', '85ml'];
export const concentrations: ConcentrationOption[] = ['EDP', 'Extrait'];

export const products: Product[] = [
  {id:'velvet-noir',name:'Velvet Noir',family:'Amber',notes:['Amber','Vanilla','Musk'],price:1299,size:'10ml',image:'https://images.unsplash.com/photo-1594035910663-369b72b7abe2?q=80&w=1200&auto=format&fit=crop',rating:4.9,reviews:186,stock:18,tag:'Best Seller',description:'Warm amber, creamy vanilla, and soft musk for evening confidence.',variants:[{concentration:'EDP',prices:{'10ml':1299,'15ml':1699,'50ml':4299,'85ml':6499}},{concentration:'Extrait',prices:{'10ml':1599,'15ml':2199,'50ml':5599,'85ml':8299}}]},
  {id:'bloom-eclat',name:'Bloom Éclat',family:'Floral',notes:['Rose','Pear','White Floral'],price:1199,size:'10ml',image:'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop',rating:4.8,reviews:142,stock:24,tag:'Fresh Floral',description:'Bright rose petals and airy florals for a clean feminine signature.',variants:[{concentration:'EDP',prices:{'10ml':1199,'15ml':1599,'50ml':3899,'85ml':5999}},{concentration:'Extrait',prices:{'10ml':1499,'15ml':1999,'50ml':4999,'85ml':7699}}]},
  {id:'oud-royale',name:'Oud Royale',family:'Oud',notes:['Oud','Saffron','Smoke'],price:1799,size:'10ml',image:'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1200&auto=format&fit=crop',rating:4.9,reviews:97,stock:9,tag:'Luxury Pick',description:'Bold oud, smoky woods, and saffron for a strong luxury impression.',variants:[{concentration:'EDP',prices:{'10ml':1799,'15ml':2499,'50ml':6299,'85ml':9499}},{concentration:'Extrait',prices:{'10ml':2299,'15ml':3199,'50ml':7899,'85ml':11999}}]},
  {id:'citrus-muse',name:'Citrus Muse',family:'Citrus',notes:['Bergamot','Neroli','Cedar'],price:999,size:'10ml',image:'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1200&auto=format&fit=crop',rating:4.7,reviews:121,stock:31,tag:'Daily Wear',description:'Fresh citrus opening with neroli and smooth cedar for everyday use.',variants:[{concentration:'EDP',prices:{'10ml':999,'15ml':1399,'50ml':3499,'85ml':5299}},{concentration:'Extrait',prices:{'10ml':1299,'15ml':1799,'50ml':4599,'85ml':6999}}]},
  {id:'midnight-cedar',name:'Midnight Cedar',family:'Woody',notes:['Cedarwood','Cardamom','Vetiver'],price:1399,size:'10ml',image:'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1200&auto=format&fit=crop',rating:4.8,reviews:109,stock:15,tag:'Woody Classic',description:'Deep cedar, dry vetiver, and spicy cardamom for polished elegance.',variants:[{concentration:'EDP',prices:{'10ml':1399,'15ml':1899,'50ml':4699,'85ml':6999}},{concentration:'Extrait',prices:{'10ml':1699,'15ml':2399,'50ml':5999,'85ml':8999}}]},
  {id:'aqua-lumiere',name:'Aqua Lumière',family:'Fresh',notes:['Sea Salt','Jasmine','White Musk'],price:1099,size:'10ml',image:'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1200&auto=format&fit=crop',rating:4.6,reviews:88,stock:22,tag:'Clean Scent',description:'Aquatic freshness with jasmine and white musk for a clean impression.',variants:[{concentration:'EDP',prices:{'10ml':1099,'15ml':1499,'50ml':3699,'85ml':5599}},{concentration:'Extrait',prices:{'10ml':1399,'15ml':1899,'50ml':4799,'85ml':7199}}]},
];
export const reviews = [
  {name:'Mika',text:'Velvet Noir feels expensive and lasts the whole night.',rating:5},
  {name:'Janelle',text:'Bloom Éclat smells elegant but still fresh for daytime.',rating:5},
  {name:'Ryan',text:'The currency switcher and cart make the store easy to use.',rating:5},
];
