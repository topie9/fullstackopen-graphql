import React, { useState, useEffect } from 'react'

const Recommend = (props) => {
  const [books, setBooks] = useState([])

  useEffect(() => {
    if (props.user) {
      setBooks(props.result.data.allBooks
        .filter(b => b.genres.includes(props.user.favoriteGenre))
      )
    }
  },[props.user, props.result.data.allBooks])

  if (!props.show || !props.user) {
    return null
  }
  if (props.result.loading) {
    return <div>loading...</div>
  }

  if (books.length < 1) {
    return <div>sorry... no books to recommend this time</div>
  }
  
  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre <b>{props.user.favoriteGenre}</b>
      </div>

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
    </div>
  )
}

export default Recommend