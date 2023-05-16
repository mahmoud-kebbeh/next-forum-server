export const typeDefs = `#graphql
	type User {
    _id: ID!
    index: Int!
    displayName: String!
    username: String!
    email: String!
    password: String!
    slug: String!
    path: String!
    
    roles: [String]
    permissions: [String]

    phoneNumber: String
    picture: String
    rank: String
    signature: String

    hidden: Boolean
    banned: Boolean

    createdAt: String
    updatedAt: String

    topicsCount: Int
    commentsCount: Int

    topics(topicsLimit: Int, hidden: Boolean, sort: String): [Topic]
    comments(commentsLimit: Int, hidden: Boolean, sort: String): [Comment]

    followers: [User]
    following: [User]
  }

  type Forum {
    _id: ID!
    index: Int!
    title: String!
    slug: String!
    path: String!

    description: String

    hidden: Boolean

    createdAt: String
    updatedAt: String

    topicsCount: Int
    commentsCount: Int

    topics(topicsLimit: Int, hidden: Boolean, sort: String): [Topic]
    comments(commentsLimit: Int, hidden: Boolean, sort: String): [Comment]
  }

  type Topic {
    _id: ID!
    index: Int!
    title: String!
    forumId: ID!
    userId: ID!
    slug: String!
    path: String!

    hidden: Boolean
    
    createdAt: String
    updatedAt: String
    
    commentsCount: Int

    forum: Forum
    user: User
    
    comments(commentsLimit: Int, hidden: Boolean, sort: String): [Comment]
  }

  type Comment {
    _id: ID!
    index: Int!
    content: String!
    topicId: ID!
    userId: ID!

    hidden: Boolean

    createdAt: String
    updatedAt: String

    topic: Topic
    user: User
  }

	type Query {
    users(usersLimit: Int, hidden: Boolean, sort: String): [User]!
    user(_id: ID, slug: String): User

    forums(forumsLimit: Int, hidden: Boolean, sort: String): [Forum]!
    forum(_id: ID, slug: String): Forum

    topics(topicsLimit: Int, hidden: Boolean, sort: String): [Topic]!
    topic(_id: ID, slug: String): Topic

    comments(commentsLimit: Int, hidden: Boolean, sort: String): [Comment]!
    comment(_id: ID!): Comment
  }

  type Mutation {
  	createUser(displayName: String!, email: String!, password: String!): User!
    updateUserCore(_id: ID!, displayName: String!, email: String!, password: String!): User!
    updateUserPriviliges(_id: ID!, roles: [String], permissions: [String]): User!
    updateUserInfo(_id: ID!, phoneNumber: String, picture: String, rank: String, signature: String): User!
    toggleHideUser(_id: ID!): Boolean!
    toggleBanUser(_id: ID!): Boolean!
    toggleFollowUser(followerId: ID!, followingId: ID!): Boolean!
    deleteUser(_id: ID!): Boolean!
    deleteAllUsers: Boolean!


    createForum(title: String!, description: String): Forum!
    updateForum(_id: ID!, title: String!, description: String): Forum!
    toggleHideForum(_id: ID!): Boolean!
    deleteForum(_id: ID!): Boolean!
    deleteAllForums: Boolean!


    createTopic(title: String!, forumId: ID!, userId: ID!): Topic!
    updateTopic(_id: ID!, title: String!): Topic!
    updateTopicForum(_id: ID!, forumId: ID!, newForumId: ID!): Topic!
    toggleHideTopic(_id: ID!): Boolean!
    deleteTopic(_id: ID!): Boolean!
    deleteAllTopics: Boolean!


    createComment(content: String!, topicId: ID!, userId: ID!): Comment!
    updateComment(_id: ID!, content: String!): Comment!
    toggleHideComment(_id: ID!): Boolean!
    deleteComment(_id: ID!): Boolean!
    deleteAllComments: Boolean!


    createTopicWithComment(title: String!, content: String!, forumId: ID!, userId: ID!): Topic!

    login(displayName: String, username: String, email: String, password: String!): User!
    signup(displayName: String!, email: String!, password: String!): User!
  }
`;
