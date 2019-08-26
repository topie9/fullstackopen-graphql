const { ApolloServer, gql, UserInputError,
  AuthenticationError, } = require('apollo-server')
//const uuidv1 = require('uuid/v1')
const mongoose = require('mongoose')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

mongoose.set('useFindAndModify', false)

console.log('connecting to', process.env.MONGODB_URI)

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({})
      .populate('author', { name: 1, })
      
      const booksAuthorOrNo = !args.author 
        ? books 
        : books.filter(b => b.author === args.author)

      const booksGenreOrNo = !args.genre
        ? booksAuthorOrNo
        : booksAuthorOrNo.filter(b => b.genres.includes(args.genre))
        console.log(booksGenreOrNo)
      return booksGenreOrNo
    },
    allAuthors: async (root, args) => {
      try {
        const authors = await Author.find({})
        
        return await Promise.all(authors.map(async a => {
          const authorBooks = await Book.find({ author: { $in: a._id } })  
          return (
            author = {
              id: a._id,
              name: a.name,
              born: a.born,
              bookCount: authorBooks.length
            }
          )
        }))

      } catch (error) {
        console.log(error)
      }
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      try {
        let authorObj = await Author.findOne({ name: args.author })    
        if (!authorObj) {
          const author = new Author({
            name: args.author
          })
          authorObj = await author.save()
        }

        const book = new Book({ 
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: authorObj._id
        })
      
        const bookObj = await book.save()
        bookObj.author.name = authorObj.name
        bookObj.author.id = authorObj._id
  
        return bookObj

      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      try {
        const authorObj = await Author.findOne({ name: args.name })
        authorObj.born = args.setBornTo

        return await authorObj.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    createUser: async (root, args) => {
      try {
        const user = new User({ 
          username: args.username,
          favoriteGenre: args.favoriteGenre,
        })
        return await user.save()

      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    login: async (root, args) => {
      try {
        const user = await User.findOne({ username: args.username })
        if (!user || args.password !== 'secret') {
          throw new UserInputError('wrong credentials')
        }
        const userForToken = {
          username: user.username,
          id: user._id,
        }
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }

      } catch(error) {
        console.log(error)
      }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLocaleLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})