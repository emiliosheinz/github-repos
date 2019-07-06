import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { FaArrowRight, FaArrowLeft, FaSpinner } from 'react-icons/fa'

import api from '../../services/api'

import Loader from '../../components/Loader'
import Container from '../../components/Container'
import {
  Loading,
  Owner,
  IssueList,
  IssueDetails,
  Selector,
  ChangePageButton,
  ButtonsContainer,
} from './styles'

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  }

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    issueState: 'all',
    rightButtonLoading: false,
    leftButtonLoading: false,
  }

  async componentDidMount() {
    const { match } = this.props
    const { issueState, page } = this.state

    const repoName = decodeURIComponent(match.params.repository)

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      this.getIssuesFromAPI(repoName, issueState, page),
    ])

    this.setState({
      repository: repository.data,
      issues,
      loading: false,
    })
  }

  handleSelectChange = async e => {
    const { match } = this.props
    const issueState = e.target.value

    const repoName = decodeURIComponent(match.params.repository)

    const issues = await this.getIssuesFromAPI(repoName, issueState, 1)

    this.setState({
      issues,
      issueState,
      page: 1,
    })
  }

  handleLeftButtonClick = async () => {
    this.setState({ leftButtonLoading: true })
    const { page, issueState } = this.state
    const { match } = this.props

    const repoName = decodeURIComponent(match.params.repository)

    const issues = await this.getIssuesFromAPI(repoName, issueState, page - 1)

    this.setState({
      page: page - 1,
      issues,
      leftButtonLoading: false,
    })
  }

  handleRightButtonClick = async () => {
    this.setState({ rightButtonLoading: true })
    const { page, issueState } = this.state
    const { match } = this.props

    const repoName = decodeURIComponent(match.params.repository)

    const issues = await this.getIssuesFromAPI(repoName, issueState, page + 1)

    this.setState({
      page: page + 1,
      issues,
      rightButtonLoading: false,
    })
  }

  getIssuesFromAPI = async (repoName, state, page) => {
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page,
        per_page: 5,
      },
    })

    return issues.data
  }

  render() {
    const {
      repository,
      issues,
      loading,
      page,
      rightButtonLoading,
      leftButtonLoading,
    } = this.state

    if (loading) {
      return <Loading>Carregando</Loading>
    }

    return (
      <Container>
        <Owner>
          <Link to='/'>Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Selector onChange={this.handleSelectChange}>
          <option value='all'>Todos</option>
          <option value='open'>Abertos</option>
          <option value='closed'>Fechados</option>
        </Selector>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <IssueDetails>
                <strong>
                  <a href={issue.html_url} target='blank'>
                    {issue.title}
                  </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </IssueDetails>
            </li>
          ))}
        </IssueList>
        <ButtonsContainer>
          <ChangePageButton
            onClick={this.handleLeftButtonClick}
            title='Voltar uma página'
            disabled={page === 1}
          >
            {leftButtonLoading ? (
              <Loader>
                <FaSpinner />
              </Loader>
            ) : (
              <FaArrowLeft />
            )}
          </ChangePageButton>
          <p>Página {page}</p>
          <ChangePageButton
            onClick={this.handleRightButtonClick}
            title='Avançar uma página'
          >
            {rightButtonLoading ? (
              <Loader>
                <FaSpinner />
              </Loader>
            ) : (
              <FaArrowRight />
            )}
          </ChangePageButton>
        </ButtonsContainer>
      </Container>
    )
  }
}

export default Repository
