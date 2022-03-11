# Iris UI

This is an interface for interacting a with an [Iris](https://iridium-labs.github.io) node. The purpose of this user interface is to demonstrate integration with the Iris blockchain.

## Setup

### Prerequisites

- Setup and run an [Iris node](https://github.com/iridium-labs/substrate/tree/iris)
- Setup and run an [IPFS node](https://docs.ipfs.io/install/)
  - It is assumed that the IPFS node exposes it's api on the default port: `4001`.

### Installation

The app requires that you pass your ipv4 as the REACT_APP_IPV4 parameter.

**From Sources:**

- clone this repository then run `npm i & REACT_APP_IPV4="x.y.z" npm start` to start the application on `localhost:3000`. where `x.y.z` is your ipv4.

**From docker:**

- `docker install iridium/iris-ui`
- `docker run -it --rm -p 3000:3000 -e REACT_APP_IPV4="X.Y.Z" iridiumlabs/iris-ui:latest`
