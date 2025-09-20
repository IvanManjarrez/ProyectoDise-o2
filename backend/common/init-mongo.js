// MongoDB initialization script
db = db.getSiblingDB('artgallery');

// Create collections
db.createCollection('users');
db.createCollection('artworks');
db.createCollection('museums');
db.createCollection('favorites');
db.createCollection('viewlogs');

// Insert sample museums
db.museums.insertMany([
  {
    name: "Louvre Museum",
    source: "louvre",
    description: "The world's largest art museum",
    website: "https://louvre.fr",
    location: "Paris, France",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Metropolitan Museum of Art",
    source: "met",
    description: "One of the world's largest and most comprehensive art museums",
    website: "https://metmuseum.org",
    location: "New York, USA",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Museo del Prado",
    source: "prado",
    description: "Spanish national art museum",
    website: "https://museodelprado.es",
    location: "Madrid, Spain",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample artworks
db.artworks.insertMany([
  {
    title: "Mona Lisa",
    artist: "Leonardo da Vinci",
    description: "Portrait of Lisa Gherardini",
    imageUrl: "https://picsum.photos/400/600?random=1",
    museumId: "louvre",
    externalId: "mona-lisa-001",
    source: "louvre",
    year: 1503,
    medium: "Oil on poplar panel",
    dimensions: "77 cm × 53 cm",
    tags: ["portrait", "renaissance", "leonardo"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    description: "Post-impressionist masterpiece",
    imageUrl: "https://picsum.photos/400/600?random=2",
    museumId: "met",
    externalId: "starry-night-001",
    source: "met",
    year: 1889,
    medium: "Oil on canvas",
    dimensions: "73.7 cm × 92.1 cm",
    tags: ["post-impressionism", "van gogh", "stars"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Las Meninas",
    artist: "Diego Velázquez",
    description: "Complex and enigmatic composition",
    imageUrl: "https://picsum.photos/400/600?random=3",
    museumId: "prado",
    externalId: "las-meninas-001",
    source: "prado",
    year: 1656,
    medium: "Oil on canvas",
    dimensions: "318 cm × 276 cm",
    tags: ["baroque", "velazquez", "spanish"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "The Great Wave",
    artist: "Hokusai",
    description: "Famous Japanese woodblock print",
    imageUrl: "https://picsum.photos/400/600?random=4",
    museumId: "met",
    externalId: "great-wave-001",
    source: "met",
    year: 1831,
    medium: "Woodblock print",
    dimensions: "25.7 cm × 37.9 cm",
    tags: ["japanese", "ukiyo-e", "wave"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    description: "Baroque Period painting",
    imageUrl: "https://picsum.photos/400/600?random=5",
    museumId: "louvre",
    externalId: "pearl-earring-001",
    source: "louvre",
    year: 1665,
    medium: "Oil on canvas",
    dimensions: "44.5 cm × 39 cm",
    tags: ["baroque", "vermeer", "portrait"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Database initialized with sample data!");