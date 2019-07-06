import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa'

import api from '../../services/api'

import Container from '../../components/Container'
import Loader from '../../components/Loader'
import { Form, SubmitButton, List, Input } from './styles'

class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    searchError: false,
  }

  componentDidMount() {
    const repositories = localStorage.getItem('repositories')

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) })
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories))
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value })
  }

  handleInputFocus = () => {
    this.setState({
      searchError: false,
    })
  }

  handleSubmit = async e => {
    e.preventDefault()

    this.setState({ loading: true })

    const { newRepo, repositories } = this.state

    try {
      const isRepoDuplicated = repositories.filter(
        repo => repo.name.toLowerCase() === newRepo.toLowerCase()
      )

      if (isRepoDuplicated.length > 0) {
        throw new { message: 'Duplicated repository' }()
      }

      const response = await api.get(`/repos/${newRepo}`)

      const data = {
        name: response.data.full_name,
        id: response.data.id,
      }

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      })
    } catch (err) {
      this.setState({
        searchError: true,
        loading: false,
      })
    }
  }

  render() {
    const { newRepo, repositories, loading, searchError } = this.state

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositorios
        </h1>
        <Form onSubmit={this.handleSubmit}>
          <Input
            type='text'
            placeholder='Adicionar repositório'
            value={newRepo}
            onChange={this.handleInputChange}
            onFocus={this.handleInputFocus}
            searchError={searchError}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <Loader>
                <FaSpinner />
              </Loader>
            ) : (
              <FaPlus />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.id}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    )
  }
}

export default Main
