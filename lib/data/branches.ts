export interface Branch {
  id: string
  name: string
  slug: string
  is_delivery_hub: boolean
  opening_time: string
  closing_time: string
  is_active: boolean
  address: string
  phone: string
}

export const BRANCHES: Branch[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Little Lumley Branch',
    slug: 'little-lumley',
    is_delivery_hub: false,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: 'Lumley Beach Road, Freetown',
    phone: '+232 76 100 201',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    name: 'Big Lumley Branch',
    slug: 'big-lumley',
    is_delivery_hub: false,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: 'Lumley Roundabout, Freetown',
    phone: '+232 76 100 202',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    name: 'Wilkinson Road Branch',
    slug: 'wilkinson-road',
    is_delivery_hub: false,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: 'Wilkinson Road, Freetown',
    phone: '+232 76 100 203',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    name: 'Old Railway Line Branch',
    slug: 'old-railway-line',
    is_delivery_hub: false,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: 'Old Railway Line, Tengbeh Town, Freetown',
    phone: '+232 76 100 204',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    name: 'Wilberforce Street Branch',
    slug: 'wilberforce-street',
    is_delivery_hub: false,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: 'Wilberforce Street, Central Freetown',
    phone: '+232 76 100 205',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000006',
    name: 'Jui Branch',
    slug: 'jui',
    is_delivery_hub: false,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: 'Jui Junction, Freetown Peninsula',
    phone: '+232 76 100 206',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000007',
    name: '392',
    slug: '392',
    is_delivery_hub: true,
    opening_time: '10:00:00',
    closing_time: '02:00:00',
    is_active: true,
    address: '392 Main Delivery Hub, Freetown',
    phone: '+232 76 100 392',
  },
]

export function getBranches(): Branch[] {
  return BRANCHES
}

export function getDeliveryHub(): Branch {
  const hub = BRANCHES.find((b) => b.is_delivery_hub)
  if (!hub) {
    throw new Error('No delivery hub found in branches configuration')
  }
  return hub
}

export function getBranchBySlug(slug: string): Branch | undefined {
  return BRANCHES.find((b) => b.slug.toLowerCase() === slug.toLowerCase())
}

export function getRetailBranches(): Branch[] {
  return BRANCHES.filter((b) => !b.is_delivery_hub)
}
