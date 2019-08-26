import React, { useState, useEffect } from 'react'

const Books = (props) => {
  const [books, setBooks] = useState([])
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  useEffect(() => {
    if (!props.result.loading) {
      let bookGenres = []
      props.result.data.allBooks.forEach(b => 
        b.genres.forEach(g => bookGenres.push(g))
      )
      setGenres(bookGenres.filter((g, idx) => bookGenres.indexOf(g) === idx))
      setGenre('all')
    }
  },[props.result.loading])

  useEffect(() => {
    if (props.result.loading) {
      return
    }
    if (genre === 'all') {
      setBooks(props.result.data.allBooks)
    } else {
      setBooks(props.result.data.allBooks.filter(b => b.genres.includes(genre)))
    }   
  },[genre])

  if (!props.show) {
    return null
  }
  if (props.result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>
      {genre !== '' && genre !== 'all'
        ? <div>
          in genre <b>{genre}</b>
        </div>
        : <div><b>all books</b></div>
      }

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <p>filter by genre
        <select
          value={genre}
          onChange={({ target }) => setGenre(target.value)}
        >
          <option value='all'>All</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>
          )}
        </select>
        </p>
      </div>
    </div>
  )
}

export default Books