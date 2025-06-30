# Oceanlab Expense & Project Management System

A comprehensive web application built with React, TypeScript, and Next.js that uses Google Sheets as a database for managing clients, expenses, projects, and profit tracking.

## Features

- **Dashboard**: Overview of business metrics and performance
- **Client Management**: Add, view, and manage client information
- **Expense Tracking**: Track business expenses by category
- **Project Management**: Monitor project timelines and status
- **Profit Analysis**: Calculate and visualize project profitability
- **Authentication**: Secure login system with role-based access
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Next.js 14
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Google Sheets API
- **Authentication**: JWT tokens
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet with the following tabs:
   - `Clients` (columns: ID, Nickname, Address, City, CreatedAt)
   - `Income_Transactions` (columns: ID, ClientID, Amount, Date, Description, ProjectID)
   - `Expenses` (columns: ID, Category, Amount, ProjectID, Date, Description)
   - `Projects` (columns: ID, Name, ClientID, StartDate, EndDate, Status)
   - `Users` (columns: ID, Username, Password, Role, CreatedAt)

2. Create a Google Service Account:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create credentials (Service Account)
   - Download the JSON key file

3. Share your Google Sheet with the service account email

### 2. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd oceanlab-expense-manager

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### 4. Default Login

For demo purposes, you can use:
- **Username**: admin
- **Password**: admin123

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── clients/           # Client management
│   ├── expenses/          # Expense tracking
│   ├── projects/          # Project management
│   └── profits/           # Profit analysis
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── auth-provider.tsx # Authentication context
├── lib/                   # Utility functions
│   ├── google-sheets.ts  # Google Sheets service
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
\`\`\`

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Token verification
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/clients` - Fetch clients
- `POST /api/clients` - Create client
- `GET /api/profits` - Calculate project profits

## Security Features

- JWT-based authentication
- Secure credential storage
- Input validation and sanitization
- Error handling and logging
- Role-based access control

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `JWT_SECRET`

## Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Email notifications
- [ ] File upload capabilities
- [ ] Mobile app version
- [ ] Integration with accounting software
- [ ] Automated backup system
- [ ] Multi-currency support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
\`\`\`
