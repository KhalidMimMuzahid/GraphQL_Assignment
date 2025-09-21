/**
 * GraphQL Schema Definitions
 * Centralized schema management with modular type definitions
 */

const { gql } = require('graphql-tag');

// Base scalar types
const scalars = gql`
  scalar Long
  scalar JSON
`;

// Common types
const commonTypes = gql`
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Connection {
    edges: [Edge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Edge {
    node: Node!
    cursor: String!
  }

  interface Node {
    id: ID!
  }
`;

// Resource Template types
const resourceTemplateTypes = gql`
  type ResourceTemplate implements Node {
    id: ID!
    _id: ID!
    createdAt: Long!
    updatedAt: Long
    name: String!
    description: String
    schema: JSON
    integrationId: String
    functionString: String
    key: String
  }
`;

// Action types
const actionTypes = gql`
  type Action implements Node {
    id: ID!
    _id: ID!
    createdAt: Long!
    updatedAt: Long
    name: String!
    description: String
    functionString: String
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }
`;

// Trigger types
const triggerTypes = gql`
  type Trigger implements Node {
    id: ID!
    _id: ID!
    createdAt: Long!
    updatedAt: Long
    name: String!
    description: String
    functionString: String
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }
`;

// Response types
const responseTypes = gql`
  type Response implements Node {
    id: ID!
    _id: ID!
    createdAt: Long!
    updatedAt: Long
    name: String!
    description: String
    platforms: [ResponsePlatform]
  }

  type ResponsePlatform {
    integrationId: ID
    build: Int
    localeGroups: [ResponseLocaleGroup]
  }

  type ResponseLocaleGroup {
    localeGroupId: ID
    variations: [ResponseVariation]
  }

  type ResponseVariation {
    name: String!
    responses: JSON
  }
`;

// Node types
const nodeTypes = gql`
  type NodeObject implements Node {
    id: ID!
    _id: ID!
    createdAt: Long!
    updatedAt: Long
    name: String!
    description: String
    parents: [NodeObject]
    parentIds: [ID]
    root: Boolean
    trigger: Trigger
    triggerId: ID
    responses: [Response]
    responseIds: [ID]
    actions: [Action]
    actionIds: [ID]
    priority: Float
    compositeId: ID
    global: Boolean
    colour: String
  }
`;

// Query types
const queryTypes = gql`
  type Query {
    # Node queries
    node(nodeId: ID): NodeObject
    nodes(first: Int, after: String, filter: NodeFilter): Connection
    
    # Trigger queries
    trigger(triggerId: ID): Trigger
    triggers(first: Int, after: String, filter: TriggerFilter): Connection
    
    # Action queries
    action(actionId: ID): Action
    actions(first: Int, after: String, filter: ActionFilter): Connection
    
    # Response queries
    response(responseId: ID): Response
    responses(first: Int, after: String, filter: ResponseFilter): Connection
    
    # Resource Template queries
    resourceTemplate(templateId: ID): ResourceTemplate
    resourceTemplates(first: Int, after: String, filter: ResourceTemplateFilter): Connection
    
    # System queries
    health: HealthStatus
    stats: SystemStats
  }
`;

// Input types
const inputTypes = gql`
  input NodeFilter {
    name: String
    root: Boolean
    global: Boolean
    colour: String
  }

  input TriggerFilter {
    name: String
    resourceTemplateId: ID
  }

  input ActionFilter {
    name: String
    resourceTemplateId: ID
  }

  input ResponseFilter {
    name: String
  }

  input ResourceTemplateFilter {
    name: String
    integrationId: String
    key: String
  }
`;

// System types
const systemTypes = gql`
  type HealthStatus {
    status: String!
    timestamp: String!
    uptime: Long!
    version: String!
  }

  type SystemStats {
    totalNodes: Int!
    totalTriggers: Int!
    totalActions: Int!
    totalResponses: Int!
    totalResourceTemplates: Int!
    lastUpdated: String!
  }
`;

// Combine all schemas
const typeDefs = gql`
  ${scalars}
  ${commonTypes}
  ${resourceTemplateTypes}
  ${actionTypes}
  ${triggerTypes}
  ${responseTypes}
  ${nodeTypes}
  ${queryTypes}
  ${inputTypes}
  ${systemTypes}
`;

module.exports = typeDefs;
