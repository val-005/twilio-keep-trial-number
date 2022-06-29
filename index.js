const { accountSid, authToken, FROM_NUMBER, TO_NUMBER, CLOUDFLARE_ID, CLOUDFLARE_KEY, CHECK_STATUS_REQUEST_LINK, CHECK_STATUS_INTERVAL_MIN, CHECK_STATUS } = require('/data/config/config.json');
const client = require('twilio')(accountSid, authToken);
const axios = require('axios');

function formatDate(date, boolean) {
  let day = []
  let monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

  day.push(date.getDate(), month = date.getMonth(), year = date.getFullYear(), hour = ('0' + date.getHours()).slice(-2), minutes = ('0' + date.getMinutes()).slice(-2))

  day.splice(1)

  return `${day.join('')} ${monthNames[parseInt(month, 10)]} ${year} ${boolean === true ? "à "+hour + ':' + minutes : ""}`;
}


var fetch_last_message_date = client.messages.list({ limit: 1 })
      .then(messages => { return messages[0].dateSent; })


const condition = () => {
    fetch_last_message_date.then((value) => {
        console.log(`Dernier SMS envoyé le ${formatDate(new Date(value), true)} (CEST)`);
        if (value < Date.now() - (1000 * 60 * 60 * 24 * 55)) {
            console.log(formatDate(new Date(), true), 'UTC : Envoi du SMS ...');
            client.messages.create({
              body: 'Envoi d un SMS après 55 jours pour ne pas perdre le numéro, veuillez ignorer le message.',
              from: FROM_NUMBER,
              to: TO_NUMBER
            })
            .then(message => console.log(message.sid));
          } else {
            console.log(formatDate(new Date(), true), 'UTC : Pas de SMS envoyé !');
          }
    });
  };
condition();
setInterval(condition, 1000 * 60 * 60 * 24);


const checkstatus = async () => {
  // authenticate with Cloudflare access token
  const auth = {
    headers: {
      'CF-Access-Client-Id': CLOUDFLARE_ID,
      'CF-Access-Client-Secret': CLOUDFLARE_KEY
    }
  };
  // get request status with cloudflare access token
  await axios.get(CHECK_STATUS_REQUEST_LINK, auth);
}
if(CHECK_STATUS === true) {
 checkstatus();
 setInterval(checkstatus, CHECK_STATUS_INTERVAL_MIN * 60 * 1000);
}