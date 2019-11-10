import React, { Component } from 'react'

class KeySelect extends Component {

  onFileSelect(e){
    const files =  e.target.files
    this.props.processKeyFile(files)
  }

  render(){
    return (
      <div className="pl-2 pt-2">
         <button
            className="btn btn-primary"
            onClick={()=>document.getElementById("file").click()}
            >Sign in with ARWeave Private Key
          </button>
          <input 
            style={{display:"none"}} 
            type="file" 
            id="file"
            onChange={this.onFileSelect.bind(this)}>
          </input>
      </div>
    )
  }
}

export default KeySelect