# NFT Billboard

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## How to run in development mode

- Create a contract on **Remix**
- Set up a test `ganache` environment and connect **Remix** to it (just like we did for the assignment)
- Install the **Metamask** plugin and [connect](https://www.geeksforgeeks.org/how-to-set-up-ganche-with-metamask/) to the `ganache` network we just created
- Copy the contract abi to `src/contracts/nft-billboard.json` and set the correct `contractAddress` in `src/App.js`
- Run `npm start`, and open [http://localhost:3000](http://localhost:3000) to view the app in your browser; the page will reload when you make changes

## Project structure
- `App.js` is the entry point which checks if a Metamask wallet is connected, and prompts the user to connect if it's not the case
- `Billboard.js` is the actual app which interacts with the Ethereum contract


<!-- ## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it. -->

<!-- ## Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment) -->