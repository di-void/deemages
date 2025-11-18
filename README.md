# DeeMages

A lightweight image processing and management service built with Express.js and TypeScript. Upload, store, and transform images with ease through a clean REST API.

## Features

### Core Features ✅

- **User Authentication** - Register, login, and logout with secure password hashing (Argon2)
- **Image Upload** - Upload JPEG and PNG images with automatic validation and metadata extraction
- **Image Transformations** - Apply real-time transformations including:
  - **Resize** - Scale images to specific dimensions or by percentage
  - **Crop** - Extract specific regions from images
  - **Format Conversion** - Convert between JPEG and PNG formats
- **Image Management** - List, retrieve, and manage your uploaded images with pagination support
- **Rate Limiting** - API rate limiting to prevent abuse (10 requests per 5 minutes)
- **SQLite Database** - Persistent storage with Drizzle ORM for images and user data

### Planned Features 🚧

- **Image Caching** - Cache transformed images for improved performance
- **Multiple Storage Options** - Support for S3 and other cloud storage providers
- **Advanced Transformations** - Additional filters, effects, and transformations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Image Processing**: Sharp
- **Authentication**: Lucia Auth with Argon2 hashing
- **Validation**: Zod
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd deemages
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```env
PORT=

# This is where uploaded and transformed images are stored and served from by default
# It is relative to a 'public/images' directory, hence DO NOT prefix
# hence, DO NOT prefix with a slash (/) or dot (.)
STORAGE_PATH=
```

4. Run database migrations

```bash
npm run db:push
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

### Production

Build and start the server:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Images

- `GET /api/v1/images` - List all user images (paginated)
- `GET /api/v1/images/:imageId` - Retrieve specific image metadata
- `POST /api/v1/images/upload` - Upload a new image
- `POST /api/v1/images/transform` - Transform an image
- `GET /api/v1/images/list-transforms` - View available transformations

## Project Structure

```
src/
├── config/          # Configuration and constants
├── controllers/     # Request handlers
│   ├── auth.ts     # Authentication logic
│   └── image/      # Image processing logic
├── db/             # Database schema and connection
├── middleware/     # Express middleware
├── routes/         # API route definitions
├── utils/          # Helpers, validators, utilities
└── index.ts        # Application entry point

types/              # TypeScript type definitions
public/             # Static files and uploaded images
drizzle/            # Database migrations
```

## Scripts

```bash
npm start              # Build and run production server
npm run dev            # Start development server with hot reload
npm run build          # Build TypeScript to JavaScript
npm run type-check     # Check for TypeScript errors
npm run generate       # Generate Drizzle migrations
npm run migrate        # Run Drizzle migrations
npm run db:push        # Push schema to database
npm run studio         # Open Drizzle Studio UI
```

## Limitations

- Images are stored on disk in `public/images/uploads/`
- Maximum upload size: 500KB per image
- Supported formats: JPEG, PNG
- Default JSON payload limit: 5MB

## Contributing

Feel free to submit issues and enhancement requests!
