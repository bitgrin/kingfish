// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
// import styles from './Block.css';

type Props = {};

export default class Block extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {num: ''}
  }
  render() {
    return (
        <div className='block'>{this.props.num}</div>
    );
  }
}