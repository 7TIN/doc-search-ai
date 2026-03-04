export interface DocItem {
  id: string;
  title: string;
  description: string;
  section: string;
  icon: string;
  url: string;
  breadcrumb: string[];
}

export const docsData: DocItem[] = [
  // Getting Started
  { id: "1", title: "Introduction", description: "Learn about the core concepts and architecture", section: "Getting Started", icon: "book", url: "/docs/introduction", breadcrumb: ["Docs", "Getting Started", "Introduction"] },
  { id: "2", title: "Quick Start Guide", description: "Set up your first project in under 5 minutes", section: "Getting Started", icon: "zap", url: "/docs/quickstart", breadcrumb: ["Docs", "Getting Started", "Quick Start"] },
  { id: "3", title: "Installation", description: "Install the CLI and configure your environment", section: "Getting Started", icon: "download", url: "/docs/installation", breadcrumb: ["Docs", "Getting Started", "Installation"] },
  { id: "4", title: "Configuration", description: "Configure your project settings and environment variables", section: "Getting Started", icon: "settings", url: "/docs/configuration", breadcrumb: ["Docs", "Getting Started", "Configuration"] },

  // Core Concepts
  { id: "5", title: "Data Modeling", description: "Define your data models using the schema language", section: "Core Concepts", icon: "database", url: "/docs/data-modeling", breadcrumb: ["Docs", "Core Concepts", "Data Modeling"] },
  { id: "6", title: "Relations", description: "Define relationships between your models", section: "Core Concepts", icon: "link", url: "/docs/relations", breadcrumb: ["Docs", "Core Concepts", "Relations"] },
  { id: "7", title: "Queries", description: "Read data from the database with type-safe queries", section: "Core Concepts", icon: "search", url: "/docs/queries", breadcrumb: ["Docs", "Core Concepts", "Queries"] },
  { id: "8", title: "Mutations", description: "Create, update, and delete records", section: "Core Concepts", icon: "edit", url: "/docs/mutations", breadcrumb: ["Docs", "Core Concepts", "Mutations"] },
  { id: "9", title: "Filtering & Sorting", description: "Filter and sort query results efficiently", section: "Core Concepts", icon: "filter", url: "/docs/filtering", breadcrumb: ["Docs", "Core Concepts", "Filtering"] },

  // Guides
  { id: "10", title: "Authentication", description: "Implement authentication with JWT and sessions", section: "Guides", icon: "shield", url: "/docs/authentication", breadcrumb: ["Guides", "Auth", "Authentication"] },
  { id: "11", title: "Authorization", description: "Role-based access control and permissions", section: "Guides", icon: "lock", url: "/docs/authorization", breadcrumb: ["Guides", "Auth", "Authorization"] },
  { id: "12", title: "Migrations", description: "Manage database schema migrations", section: "Guides", icon: "git-branch", url: "/docs/migrations", breadcrumb: ["Guides", "Database", "Migrations"] },
  { id: "13", title: "Deployment", description: "Deploy your application to production", section: "Guides", icon: "cloud", url: "/docs/deployment", breadcrumb: ["Guides", "Deployment", "Production"] },
  { id: "14", title: "Testing", description: "Write unit and integration tests", section: "Guides", icon: "check-circle", url: "/docs/testing", breadcrumb: ["Guides", "Quality", "Testing"] },

  // API Reference
  { id: "15", title: "Client API", description: "Complete reference for the client library", section: "API Reference", icon: "code", url: "/docs/api/client", breadcrumb: ["API Reference", "Client", "Overview"] },
  { id: "16", title: "CLI Commands", description: "All available CLI commands and options", section: "API Reference", icon: "terminal", url: "/docs/api/cli", breadcrumb: ["API Reference", "CLI", "Commands"] },
  { id: "17", title: "Error Handling", description: "Handle errors gracefully in your application", section: "API Reference", icon: "code", url: "/docs/api/errors", breadcrumb: ["API Reference", "Errors", "Handling"] },
  { id: "18", title: "Type Reference", description: "TypeScript type definitions and utilities", section: "API Reference", icon: "file-text", url: "/docs/api/types", breadcrumb: ["API Reference", "Types", "Reference"] },
];

export const recentSearches = [
  "How to set up authentication",
  "Data modeling best practices",
  "Deploy to production",
];
