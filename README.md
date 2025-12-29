# Real Estate Management System Admin Dashboard

A comprehensive React admin application for managing real estate properties, tenants, contracts, rent payments, construction projects, and banking operations.

## 🏢 Features

### 1. Properties Module
- Add, edit, and manage individual stores/shops
- Track property attributes: name, location, size, status, monthly rent
- Dashboard showing total properties, occupied vs vacant
- Property detail management with tenant relationships

### 2. Tenants Module
- Register and manage tenants
- Track tenant information: name, phone, ID/passport, business type
- Assign tenants to specific properties
- Monitor tenant status (active, ended, pending payment)

### 3. Contracts Module
- Generate and manage rental agreements
- Contract tracking with tenant and property association
- Contract history per tenant
- Contract expiry monitoring

### 4. Rent Payments Module
- Record and track rent payments per tenant
- Maintain complete payment ledger
- Automatic calculation of pending rent
- Monthly rent summary reports
- Dashboard widgets for rent analytics

### 5. Pending Payments/Arrears
- Dedicated view for tracking unpaid/overdue rent
- Filter by month, property, amount owed
- Send payment reminders (UI mock function)
- Outstanding payment analytics

### 6. Construction/Building Projects Module
- Manage construction projects and expenses
- Track expense types: materials, labor, equipment, etc.
- Budget vs actual spending monitoring
- Project progress timeline
- Receipt upload capability

### 7. Bank Accounts Module
- Manage multiple bank accounts
- Record deposits and withdrawals
- Running balance computation
- Bank reconciliation reports
- Transaction categorization

### 8. Dashboard
- Professional admin dashboard with widgets
- Real-time analytics and KPIs
- Charts and data visualization
- Recent activities log
- Financial overview cards

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: React Hook Form with validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📁 Project Structure

```
real-estate-admin/
├── src/
│   ├── components/
│   │   └── common/           # Reusable UI components
│   │       ├── Card.tsx      # Card components
│   │       ├── Button.tsx    # Button components
│   │       ├── Table.tsx     # Table components
│   │       └── Form.tsx      # Form components
│   ├── layouts/
│   │   └── admin/            # Admin layout
│   │       └── AdminLayout.tsx
│   ├── modules/              # Feature modules
│   │   ├── dashboard/        # Dashboard module
│   │   ├── property/         # Properties module
│   │   ├── tenants/          # Tenants module
│   │   ├── contracts/        # Contracts module
│   │   ├── rent/             # Rent payments module
│   │   ├── construction/     # Construction module
│   │   └── banking/          # Banking module
│   ├── store/                # Redux store configuration
│   ├── types/                # TypeScript type definitions
│   ├── data/                 # Mock data
│   └── hooks/                # Custom hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   # or
   yarn build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

## 📊 Sample Data

The application comes with comprehensive sample data including:

- **5 Properties**: Mix of occupied and available properties
- **3 Tenants**: Active tenants with different business types
- **3 Contracts**: Active rental agreements
- **5 Rent Payments**: Payment records with various statuses
- **2 Construction Projects**: Ongoing and planning projects
- **5 Construction Expenses**: Various expense categories
- **3 Bank Accounts**: Different account types
- **5 Bank Transactions**: Deposits and withdrawals

## 🔧 Configuration

### TailwindCSS
The project uses a custom TailwindCSS configuration with:
- Custom color palette for primary, success, warning, and danger states
- Extended spacing and typography
- Component utilities

### Redux Store
State management is organized by feature modules:
- `properties` - Property data and operations
- `tenants` - Tenant information
- `contracts` - Contract management
- `rent` - Payment tracking
- `construction` - Project and expense management
- `banking` - Account and transaction data

## 📱 Key Components

### Dashboard Widgets
- **Property Statistics**: Total, occupied, vacant counts
- **Rent Analytics**: Monthly collections, pending amounts
- **Construction Overview**: Project progress, spending
- **Banking Summary**: Account balances, monthly activity

### Data Tables
- **Sortable**: Click column headers to sort
- **Filterable**: Built-in filtering capabilities
- **Pagination**: Navigate through large datasets
- **Actions**: Edit, delete, and custom actions per row

### Forms
- **Validation**: Real-time form validation with React Hook Form
- **Error Handling**: Clear error messages and field highlighting
- **Responsive**: Mobile-friendly form layouts
- **Reusable**: Consistent form components across modules

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Color scheme supports dark mode
- **Accessibility**: Keyboard navigation and screen reader support
- **Loading States**: Skeleton screens and loading indicators
- **Empty States**: Helpful empty state messages and illustrations

## 🔐 Mock Data & API

The application uses mock data for demonstration purposes. In a real-world scenario, you would:

1. Replace mock data with actual API calls
2. Implement proper authentication
3. Add data persistence (database)
4. Implement real-time updates
5. Add file upload capabilities
6. Implement payment processing

## 📈 Future Enhancements

- **User Authentication**: Login/logout functionality
- **Role-Based Access**: Different permissions for users
- **File Uploads**: Document and receipt management
- **Email Notifications**: Automated rent reminders
- **Advanced Reporting**: PDF exports, detailed analytics
- **Mobile App**: React Native companion app
- **API Integration**: Connect to real property management systems

## 🤝 Contributing

This is a demonstration project showcasing modern React development practices. Feel free to fork and extend for your own needs.

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**