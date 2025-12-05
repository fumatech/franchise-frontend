import React, { Component } from "react";

export default class Footer extends Component {
  render() {
    const currentYear = new Date().getFullYear(); // Get the current year

    return (
      <>
        {/* <footer className="main-footer">
          <strong>
            Copyright © 2023-{currentYear}{" "}
            <a className="text-primary">Fuma.io</a>.
          </strong>
          All rights reserved.
          <div className="float-right d-none d-sm-inline-block">
            <b>Version</b> 1.1
          </div>
        </footer> */}
      </>
    );
  }
}
