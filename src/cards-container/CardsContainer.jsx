import React, { Component } from 'react';
import {
  Container,
  Header,
  Card,
  Dimmer,
  Loader,
  Transition,
} from 'semantic-ui-react';
import gql from 'graphql-tag';
import client from '../utils/agent';
import UnitCard from './UnitCard';
import { RARITY, RARITY_COLOR } from '../utils/constants';

const query = gql`
  query($rare: Int!) {
    Cards(Rare: $rare) {
      CardID
      Kind
      Name
      SellPrice
    }
  }
`;

class CardsContainer extends Component {
  constructor(props) {
    super();
    this.state = {
      units: [],
      rarity: RARITY[props.match.params.rarity],
      loading: true,
    };
  }

  componentDidMount() {
    this.updateCards();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.updateCards(nextProps);
    }
  }

  updateCards = (props = this.props) => {
    this.setState({ loading: true });
    const rarity = RARITY[props.match.params.rarity];
    client
      .query({
        query,
        variables: {
          rare: rarity,
        },
      })
      .then(res => {
        if (rarity === 4 || rarity === 5) {
          return client
            .query({ query, variables: { rare: rarity + 6 } })
            .then(res2 => [...res.data.Cards, ...res2.data.Cards]);
        }
        return res.data.Cards;
      })
      .then(res => {
        this.setState({
          rarity,
          units: res.filter(card => card.SellPrice !== 0),
          loading: false,
        });
      });
  };

  render() {
    return (
      <Container style={{ padding: 20 }}>
        <Transition visible={this.state.loading} duration={500} unmountOnHide>
          <Dimmer page active>
            <Loader>Loading</Loader>
          </Dimmer>
        </Transition>
        <Header as="h1">
          {RARITY_COLOR[this.state.rarity]}
          <Header.Subheader>只有银稀有及以上的单位才有交流</Header.Subheader>
        </Header>
        <p>该稀有度一共有{this.state.units.length}个单位。</p>
        <Header as="h2" color="red" dividing>
          ♀
        </Header>
        <Card.Group stackable>
          {this.state.units
            .filter(unit => unit.Kind === 1)
            .map(unit => (
              <UnitCard key={unit.CardID} unit={unit} />
            ))}
        </Card.Group>
        <Header as="h2" color="blue" dividing>
          ♂
        </Header>
        <Card.Group stackable>
          {this.state.units
            .filter(unit => unit.Kind === 0)
            .map(unit => (
              <UnitCard key={unit.CardID} unit={unit} />
            ))}
        </Card.Group>
        <Header as="h2" color="teal" dividing>
          ??
        </Header>
        <Card.Group stackable>
          {this.state.units
            .filter(unit => unit.Kind === 2)
            .map(unit => (
              <UnitCard key={unit.CardID} unit={unit} />
            ))}
        </Card.Group>
      </Container>
    );
  }
}

export default CardsContainer;
