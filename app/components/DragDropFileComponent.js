// @flow
import React, { Component } from 'react';
import dragdrop from '../utils/dragdrop';
const { ipcRenderer } = require('electron');
import { Button, Glyphicon } from 'react-bootstrap';
import {shell} from 'electron';

export default class DragDropFileComponent extends Component {
    dragStartHandler(event) {
        console.log('dnd');
        event.preventDefault()
        ipcRenderer.send('ondragstart', this.props.file_path)
    }
    showInExplorer() {
        shell.showItemInFolder(this.props.file_path);
    }
    render() {
        return (
            <div className='well'>
                <div draggable={true} className='dragDropIcon' onDragStart={this.dragStartHandler.bind(this)} />
                <h5 className='fileNameDrag'>{this.props.filename}</h5>
                <span onClick={this.showInExplorer.bind(this)} className='revealInFolder'><Glyphicon glyph="search" /> Reveal in folder</span>
            </div>
        );
    }
}