const typeDefs = `#graphql
	type User {
    _id: ID!
    index: Int!
    displayName: String!
    username: String!
    email: String!
    password: String!
    slug: String!
    path: String!

    phoneNumber: String
    pictureURL: String
    rank: String
    signature: String
    
    roles: [String]
    permissions: [String]

    commentsCount: Int

    createdAt: String
    updatedAt: String

    topics(topicsLimit: Int): [Topic]
    comments(commentsLimit: Int): [Comment]
  }

  type Forum {
    _id: ID!
    index: Int!
    title: String!
    slug: String!
    path: String!

    commentsCount: Int
    topicsCount: Int

    description: String
    createdAt: String
    updatedAt: String

    topics(topicsLimit: Int): [Topic]
    comments(commentsLimit: Int): [Comment]
  }

  type Topic {
    _id: ID!
    index: Int!
    title: String!
    type: String!
    forumId: ID!
    userId: ID!
    slug: String!
    path: String!

    commentsCount: Int
    
    createdAt: String
    updatedAt: String
    
    forum: Forum
    user: User
    
    comments(commentsLimit: Int): [Comment]
  }

  enum TopicType {
	  THREAD
	  CHAT  
	}

  type Comment {
    _id: ID!
    index: Int!
    content: String!
    type: String!
    forumId: ID!
    topicId: ID!
    userId: ID!

    createdAt: String
    updatedAt: String

    user: User
    forum: Forum
    topic: Topic
  }

  enum CommentType {
	  POST
	  MESSAGE  
	}

	type Query {
    users(usersLimit: Int): [User]!
    user(_id: ID!, index: Int, displayName: String, username: String, email: String): User

    forums(forumsLimit: Int): [Forum]!
    forum(_id: ID, index: Int, title: String): Forum

    topics(topicsLimit: Int): [Topic]!
    topic(_id: ID!, index: Int): Topic

    comments(commentsLimit: Int): [Comment]!
    comment(_id: ID!, index: Int): Comment
  }

  type Mutation {
  	createUser(displayName: String!, email: String!, password: String!): User!
    editUser(_id: ID!, index: Int, displayName: String, email: String, password: String): User!
    removeUser(_id: ID!, index: Int, displayName: String, username: String, email: String): User!
    removeAllUsers: Boolean!


    createForum(index: Int, title: String!, description: String): Forum!
    editForum(_id: ID!, index: Int, title: String, description: String): Forum!
    removeForum(_id: ID!, index: Int, title: String): Forum!
    removeAllForums: Boolean!


    createTopic(index: Int, title: String!, type: TopicType!, forumId: ID!, userId: ID!): Topic!
    editTopic(_id: ID!, index: Int, title: String, forumId: ID!): Topic!
    removeTopic(_id: ID!, index: Int, title: String): Topic!
    removeAllTopics: Boolean!


    createComment(content: String!, type: CommentType!, forumId: ID!, topicId: ID!, userId: ID!): Comment!
    editComment(_id: ID!, index: Int, content: String): Comment!
    removeComment(_id: ID!, index: Int): Comment!
    removeAllComments: Boolean!


    createTopicWithComment(title: String!, content: String!, topicType: TopicType!, commentType: CommentType!, forumId: ID!, userId: ID!, topicIndex: Int, commentIndex: Int): Topic!

    login(displayName: String, username: String, email: String, password: String!): User!
    signup(displayName: String!, email: String!, password: String!): User!
  }
`;

export { typeDefs };