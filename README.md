# EHR Dashboard

This is a web-based Electronic Health Record (EHR) dashboard built with Next.js, Prisma, and a SQLite database. It provides a user interface for managing patient data, appointments, and other clinical information. The application also integrates with an external FHIR API to fetch and display public diagnostic data.

## Features

-   **Patient Management**: Create, view, edit, and delete patient records.
-   **Clinical Data**: Track allergies, conditions, medications, and procedures.
-   **Appointment Scheduling**: Manage and view patient appointments.
-   **Dashboard Overview**: Get a quick glance at key metrics and recent activity.
-   **External Data Integration**: Fetch and display public diagnostic reports and observations from a HAPI FHIR server.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or Yarn

### Installation

1.  Clone the repository and navigate to the project directory:
    ```
    git clone <https://github.com/vatsal-afk/EHR_Dashboard>
    cd ehr_dashboard
    ```

2.  Install the dependencies:

    ```
    npm install
    ```

### Configuration

Create a `.env` file in the root of your project and add the following environment variables:

```env
DATABASE_URL="file:./dev.db"

FHIR_BASE_URL="[https://hapi.fhir.org/baseR4](https://hapi.fhir.org/baseR4)"
```

### Database Setup

Run the following command to create your SQLite database file and apply the initial schema migration:

```
npx prisma migrate dev --name init
```

### Running the Application

Start the development server:

```
npm run dev
```

The application will be available at http://localhost:3000.