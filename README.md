# Iris UI

This is an interface for interacting a with an [Iris](https://ideal-lab5.github.io) node. The purpose of this user interface is to demonstrate integration with the Iris blockchain.

## Setup

### Prerequisites

- Setup and run an [Iris node](https://github.com/ideal-lab5/iris/tree/master)
- Setup and run an [IPFS node](https://docs.ipfs.io/install/)

### Installation

**From Sources:**

- clone this repository then run `npm i & npm start` to start the application on `localhost:3000`

**From docker:**

- `docker install ideallabs/iris-ui`
- `docker run -it --rm -p 3000:3000 ideallabs/iris-ui:latest`

### IPFS Configuration

***This is for testing only - do not do the following in production.***
If your requests to IPFS are blocked due to CORS, run the following:

``` bash
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
```