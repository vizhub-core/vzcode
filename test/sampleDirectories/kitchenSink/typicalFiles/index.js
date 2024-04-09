// You can import API functions like this from D3.js.
import { select } from 'd3';

// You can import local ES6 modules like this. See message.js!
import { message } from './myMessage';

// This line uses D3 to set the text of the message div.
select('#message').text(message);
