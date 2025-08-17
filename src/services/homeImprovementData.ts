// Home Improvement Product Data Generator
// Creates realistic products for your B2B home improvement platform

export interface HomeImprovementProduct {
  name: string
  description: string
  price: number
  category: string
  subcategory: string
  brand: string
  sku: string
  specifications: Record<string, string>
  features: Array<string>
  applications: Array<string>
  imageKeywords: Array<string>
}

export class HomeImprovementDataService {
  // Home improvement product database
  private readonly productTemplates: Array<HomeImprovementProduct> = [
    // TOOLS & HARDWARE
    {
      name: '20V MAX Cordless Drill/Driver Kit',
      description:
        'Professional-grade cordless drill with 650 in-lbs of torque, LED work light, and 2-speed transmission. Includes 2 lithium-ion batteries, charger, and carrying case.',
      price: 199.99,
      category: 'Tools',
      subcategory: 'Power Tools',
      brand: 'ProTech',
      sku: 'PT-CD-20V-001',
      specifications: {
        Voltage: '20V MAX',
        Torque: '650 in-lbs',
        'Chuck Size': '1/2 inch',
        'Battery Type': 'Lithium-ion',
        Weight: '3.4 lbs',
      },
      features: [
        'LED work light',
        '2-speed transmission',
        'Belt hook',
        'Magnetic bit holder',
      ],
      applications: [
        'Drilling',
        'Driving screws',
        'General construction',
        'Home repairs',
      ],
      imageKeywords: ['cordless drill', 'power tool', 'construction'],
    },
    {
      name: 'Heavy-Duty Circular Saw 7-1/4"',
      description:
        '15-amp circular saw with 7-1/4" carbide-tipped blade. Features electric brake, LED cut line indicator, and dust blower for clear line of sight.',
      price: 149.99,
      category: 'Tools',
      subcategory: 'Power Tools',
      brand: 'BuildMaster',
      sku: 'BM-CS-714-001',
      specifications: {
        'Blade Size': '7-1/4 inch',
        Motor: '15 amp',
        'Max Cutting Depth': '2-9/16 inch at 90°',
        Weight: '8.8 lbs',
        'Cord Length': '8 feet',
      },
      features: [
        'Electric brake',
        'LED cut line',
        'Dust blower',
        'Magnesium shoe',
      ],
      applications: ['Framing', 'Decking', 'Siding', 'General cutting'],
      imageKeywords: ['circular saw', 'power saw', 'construction tool'],
    },

    // BUILDING MATERIALS
    {
      name: 'Pressure-Treated Lumber 2x4x8',
      description:
        'Premium pressure-treated southern yellow pine lumber. Kiln-dried after treatment for dimensional stability. Ideal for outdoor construction projects.',
      price: 8.97,
      category: 'Building Materials',
      subcategory: 'Lumber',
      brand: 'ForestPro',
      sku: 'FP-PT-2X4X8',
      specifications: {
        Dimensions: '2" x 4" x 8\'',
        Species: 'Southern Yellow Pine',
        Treatment: 'Pressure-treated',
        Grade: 'Construction grade',
        'Moisture Content': '19% or less',
      },
      features: [
        'Pressure-treated',
        'Kiln-dried',
        'Dimensional stability',
        'Weather resistant',
      ],
      applications: [
        'Deck framing',
        'Fence construction',
        'Outdoor structures',
        'Foundation work',
      ],
      imageKeywords: ['lumber', 'wood', 'pressure treated', '2x4'],
    },
    {
      name: 'Architectural Shingles - Weatherwood',
      description:
        'Premium architectural shingles with 30-year warranty. Algae-resistant granules and enhanced wind resistance up to 130 mph.',
      price: 98.5,
      category: 'Building Materials',
      subcategory: 'Roofing',
      brand: 'RoofGuard',
      sku: 'RG-AS-WW-001',
      specifications: {
        Coverage: '33.3 sq ft per bundle',
        Weight: '240 lbs per square',
        'Wind Rating': '130 mph',
        Warranty: '30 years',
        'Fire Rating': 'Class A',
      },
      features: [
        'Algae resistant',
        'Wind resistant',
        'Dimensional appearance',
        'Easy installation',
      ],
      applications: [
        'Residential roofing',
        'Commercial roofing',
        'Roof replacement',
        'New construction',
      ],
      imageKeywords: [
        'roof shingles',
        'roofing material',
        'architectural shingles',
      ],
    },

    // PLUMBING
    {
      name: 'Single Handle Kitchen Faucet with Pull-Down Sprayer',
      description:
        'Commercial-style kitchen faucet with pull-down sprayer, magnetic docking, and ceramic disc cartridge. Spot-resistant stainless steel finish.',
      price: 189.99,
      category: 'Plumbing',
      subcategory: 'Faucets',
      brand: 'AquaFlow',
      sku: 'AF-KF-PD-SS-001',
      specifications: {
        Finish: 'Spot-resistant stainless steel',
        'Spout Height': '15.75 inches',
        'Spout Reach': '9 inches',
        'Flow Rate': '1.8 GPM',
        'Valve Type': 'Ceramic disc',
      },
      features: [
        'Pull-down sprayer',
        'Magnetic docking',
        'Spot-resistant finish',
        'Easy installation',
      ],
      applications: [
        'Kitchen renovation',
        'New construction',
        'Replacement',
        'Commercial kitchens',
      ],
      imageKeywords: ['kitchen faucet', 'pull down sprayer', 'stainless steel'],
    },

    // ELECTRICAL
    {
      name: '15-Amp GFCI Outlet with LED Indicator',
      description:
        'Tamper-resistant GFCI outlet with LED indicator light. Self-test feature and weather-resistant for outdoor use. UL listed.',
      price: 24.99,
      category: 'Electrical',
      subcategory: 'Outlets & Switches',
      brand: 'SafeGuard Electric',
      sku: 'SGE-GFCI-15A-001',
      specifications: {
        Amperage: '15 amp',
        Voltage: '125V',
        Configuration: 'Duplex',
        Rating: 'Weather-resistant',
        Certification: 'UL Listed',
      },
      features: [
        'GFCI protection',
        'LED indicator',
        'Self-test',
        'Tamper-resistant',
      ],
      applications: [
        'Bathroom installation',
        'Kitchen outlets',
        'Outdoor use',
        'Safety upgrades',
      ],
      imageKeywords: ['GFCI outlet', 'electrical outlet', 'safety outlet'],
    },

    // PAINT & SUPPLIES
    {
      name: 'Premium Interior Paint - Eggshell Finish',
      description:
        'High-quality acrylic latex paint with excellent coverage and durability. Low-VOC formula with superior hide and washability.',
      price: 54.99,
      category: 'Paint & Supplies',
      subcategory: 'Interior Paint',
      brand: 'ColorMaster',
      sku: 'CM-IP-EG-001',
      specifications: {
        Coverage: '350-400 sq ft per gallon',
        Finish: 'Eggshell',
        Base: 'Acrylic latex',
        VOC: 'Less than 50 g/L',
        'Dry Time': '4 hours',
      },
      features: ['Low-VOC', 'Excellent coverage', 'Washable', 'Fade resistant'],
      applications: ['Living rooms', 'Bedrooms', 'Hallways', 'Interior walls'],
      imageKeywords: ['interior paint', 'wall paint', 'eggshell finish'],
    },

    // LAWN & GARDEN
    {
      name: 'Self-Propelled Gas Lawn Mower 21"',
      description:
        'Reliable gas-powered mower with self-propelled drive system. 3-in-1 cutting system: mulch, bag, or side discharge. Easy-start engine.',
      price: 449.99,
      category: 'Lawn & Garden',
      subcategory: 'Lawn Mowers',
      brand: 'YardMaster',
      sku: 'YM-SP-21-001',
      specifications: {
        'Cutting Width': '21 inches',
        Engine: '159cc 4-cycle',
        'Drive System': 'Self-propelled',
        'Cutting Heights': '1.25" to 3.75"',
        'Fuel Capacity': '0.95 quarts',
      },
      features: [
        'Self-propelled',
        '3-in-1 cutting',
        'Easy start',
        'Adjustable height',
      ],
      applications: [
        'Residential lawns',
        'Medium yards',
        'Regular maintenance',
        'Professional use',
      ],
      imageKeywords: ['lawn mower', 'gas mower', 'self propelled'],
    },

    // APPLIANCES
    {
      name: 'Energy Star French Door Refrigerator 25 cu ft',
      description:
        'Spacious French door refrigerator with bottom freezer, ice maker, and LED lighting. Energy Star certified with advanced temperature management.',
      price: 1899.99,
      category: 'Appliances',
      subcategory: 'Refrigerators',
      brand: 'CoolTech',
      sku: 'CT-FD-25-001',
      specifications: {
        Capacity: '25 cubic feet',
        Configuration: 'French door',
        'Energy Rating': 'Energy Star',
        'Ice Maker': 'Built-in',
        Dimensions: '36" W x 70" H x 32" D',
      },
      features: [
        'Energy Star certified',
        'LED lighting',
        'Ice maker',
        'Temperature management',
      ],
      applications: [
        'Kitchen renovation',
        'New homes',
        'Appliance replacement',
        'Energy efficiency',
      ],
      imageKeywords: [
        'french door refrigerator',
        'kitchen appliance',
        'energy star',
      ],
    },
  ]

  // Generate variations of products
  generateProductVariations(): Array<HomeImprovementProduct> {
    const variations: Array<HomeImprovementProduct> = []

    this.productTemplates.forEach((template) => {
      // Add the base product
      variations.push({
        ...template,
        sku: `${template.sku}-${String(1).padStart(3, '0')}`,
      })

      // Create variations with different specifications
      if (template.category === 'Tools') {
        // Create different voltage/size variations
        const voltages = ['12V', '18V', '20V', '24V']
        voltages.forEach((voltage, vIndex) => {
          if (voltage !== template.specifications.Voltage) {
            variations.push({
              ...template,
              name: template.name.replace(/\d+V/, voltage),
              sku: `${template.sku}-${voltage}-${String(vIndex + 1).padStart(3, '0')}`,
              price: template.price + vIndex * 25,
              specifications: {
                ...template.specifications,
                Voltage: voltage,
              },
            })
          }
        })
      }

      if (template.category === 'Building Materials') {
        // Create different sizes for lumber
        const sizes = ['2x6x8', '2x8x8', '2x10x8', '2x12x8']
        sizes.forEach((size, sIndex) => {
          variations.push({
            ...template,
            name: template.name.replace('2x4x8', size),
            sku: `${template.sku}-${size.replace(/x/g, 'X')}-${String(sIndex + 1).padStart(3, '0')}`,
            price: template.price * (1 + sIndex * 0.5),
            specifications: {
              ...template.specifications,
              Dimensions: size.replace(/x/g, '" x ') + "'",
            },
          })
        })
      }

      if (template.category === 'Paint & Supplies') {
        // Create different finishes
        const finishes = ['Flat', 'Satin', 'Semi-gloss', 'Gloss']
        finishes.forEach((finish, fIndex) => {
          if (finish !== template.specifications.Finish) {
            variations.push({
              ...template,
              name: template.name.replace('Eggshell', finish),
              sku: `${template.sku}-${finish.toUpperCase()}-${String(fIndex + 1).padStart(3, '0')}`,
              price: template.price + fIndex * 5,
              specifications: {
                ...template.specifications,
                Finish: finish,
              },
            })
          }
        })
      }
    })

    return variations
  }

  // Transform to your database schema
  transformToSchema(product: HomeImprovementProduct, categoryId: number) {
    return {
      product: {
        category_id: categoryId,
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        brand: product.brand,
        stock_quantity: Math.floor(Math.random() * 50) + 10,
        is_active: true,
        is_featured: Math.random() > 0.8,
        warranty_years: product.category === 'Tools' ? 3 : 1,
        tags: [product.category, product.subcategory, ...product.applications],
      },
      images: [
        {
          image_url: `https://picsum.photos/400/400?random=${product.sku}`,
          alt_text: product.name,
          is_primary: true,
          sort_order: 1,
        },
      ],
      attributes: [
        {
          name: 'Brand',
          value: product.brand,
          type: 'text',
          is_filterable: true,
        },
        {
          name: 'Category',
          value: product.category,
          type: 'text',
          is_filterable: true,
        },
        {
          name: 'Subcategory',
          value: product.subcategory,
          type: 'text',
          is_filterable: true,
        },
        ...Object.entries(product.specifications).map(([key, value]) => ({
          name: key,
          value: value,
          type: 'text',
          is_filterable:
            key === 'Brand' || key === 'Finish' || key === 'Voltage',
        })),
        ...product.features.map((feature) => ({
          name: 'Feature',
          value: feature,
          type: 'text',
          is_filterable: false,
        })),
      ].filter((attr) => attr.value && attr.value.trim() !== ''),
    }
  }

  // Get all home improvement products
  getAllProducts(): Array<HomeImprovementProduct> {
    return this.generateProductVariations()
  }

  // Get products by category
  getProductsByCategory(category: string): Array<HomeImprovementProduct> {
    return this.generateProductVariations().filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase()),
    )
  }
}

export const homeImprovementData = new HomeImprovementDataService()
