# HARJOITUSTYÖN DOKUMENTAATIO

Sovelluksen nimi: Animal Rescue App
Tekijä: Kia Hakala
Päivämäärä: 24.07.2024
Opintojakso: Full Stack -ohjelmointi TTC2080-3027

Linkki sovellukseen: https://animal-rescue-app.onrender.com/
Repo: https://github.com/kiahakala/animal-rescue-app

## Suunnitelma

Tarkoituksena on kehittää sovellus luonnonvaraisten eläinten pelastusringiksi. Ajatus tällaisesta sovelluksesta on pyörinyt mielessäni jo jonkin aikaa. Luonnonvaraisten eläinten auttaminen on yleensä yksityishenkilöiden varassa. Kuka tahansa voi löytää esimerkiksi emostaan eroon joutuneen poikasen, mutta eläimestä huolehtiminen ei ole mahdollista kenelle tahansa. On tärkeää tavoittaa ne henkilöt, joilla on resursseja auttaa. Sovelluksen avulla eläimen löytäjä voi ilmoittaa löydöstään ja pyytää apua.

## Toteutus

Sovelluksen keskeiset toiminnot:

- käyttäjätunnuksen luominen ja kirjautuminen
- CRUD-toimenpiteet
- sijaintitieto
- mahdollisuus reagoida ilmoituksiin
- ilmoitusten valvonta

Kaikkia toimintoja ei välttämättä implementoida ensimmäiseen versioon, mutta sovellusta voidaan jatkokehittää.

## Teknologiat

- backend: Node.js, Express
- frontend: JavaScript
- tietokanta: MongoDB
- autentikointi: JWT (JSON Web Token)
- sijaintitieto: OpenStreetMap ja Leaflet.js
- julkaisu: Render

## Rakenne

Koodin selkeyttämiseksi sovellus on jaettu backendin puolella moduuleihin. CRUD-operaatiot suoritetaan controllers-moduuleissa. Skeemat määritellään models-moduuleissa. Konfiguraatio on eriytetty utils-moduuliin.

Frontend koostuu index.html-tiedostosta, kaikki tyylit sisältävästä styles.css-tiedostosta ja kaikki JavaScript-operaatiot sisältävästä main.js-tiedostosta.

## Tietokanta

Tietokannassa on kaksi kokoelmaa: käyttäjät ja ilmoitukset.

Käyttäjään tallennetaan nimi, sähköpostiosoite, salasana, ilmoitukset ja sijainti.

Ilmoitukseen tallennetaan otsikko, kuvaus, ilmoituksen julkaisija, sijainti ja aikaleima.

## Autentikointi

Kun käyttäjä luo tunnuksen, hänen salasanansa tallennetaan tietokantaan hashattuna. Tässä käytetään bcrypt-kirjastoa.

Kirjautumista varten on luotu login-reitti. Kun käyttäjä kirjautuu lomakkeella sisään, frontend lähettää kirjautumistiedot POST-pyynnöllä login-reitille. Jos kirjautumistiedot ovat oikein, palvelin generoi yksilöivän tokenin. Selain tallentaa tokenin. Kun käyttäjä tekee kirjautumista edellyttäviä toimenpiteitä, token lähetetään mukana pyynnössä. Tokenin avulla palvelin tunnistaa käyttäjän.

Ympäristömuuttujiin on tallennettu merkkijonona digitaalinen allekirjoitus _SECRET_. Sillä varmistetaan, että vain salaisuuden tietävät voivat generoida validin tokenin.

## Sijaintitieto

Sijaintitieto tuotetaan avoimen lähdekoodin Leaflet.js-kirjaston avulla. Leaflet hyödyntää OpenStreetMapin karttatietoja. Käyttäjä voi lisätä ilmoitukseen sijainnin klikkaamalla karttaa. Sijainti tallennetaan tietokantaan koordinaatteina.

Julkaistuihin ilmoituksiin haetaan kirjallinen sijaintitieto OpenStreetMapin Nominatim-rajapinnasta _reverse geocoding_ -menetelmällä. Rajapinnalle annetaan koordinaatit, ja se palauttaa paikan nimen tai lähimmän osoitteen.

## Tärkeimmät funktiot

- **fetchPosts()**: hakee ilmoitukset tietokannasta
- **displayPosts(posts)**: näyttää ilmoitukset käyttöliittymässä sekä etusivulla että profiili-ikkunassa. Saa ilmoitukset parametrina fetchPosts-funktiossa
- **onCreate(e)**: tapahtumafunktio, joka kutsuu createPost-funktiota
- **updateMapClickListener()**: sallii paikkamerkkien lisäämisen kartalle vain, jos ilmoituksen luominen tai muokkaaminen on käynnissä
- **onMapClick(e)**: lisää paikkamerkin kartalle
- **createPost()**: luo ilmoituksen
- **removePost(id)**: poistaa ilmoituksen
- **handlePostUpdate(id)**: avaa lomakkeen ilmoituksen muokkaamista varten
- **onUpdate(e)**: tapahtumafunktio, joka kutsuu updatePost-funktiota
- **updatePost(id)**: päivittää ilmoituksen
- **displayProfile(user)**: näyttää käyttäjän tiedot profiili-ikkunassa
- **isTokenExpired()**: tarkistaa, onko käyttäjän token vanhentunut
- **setupLoginInterval()**: määrittää session keston kirjautumisesta alkaen
- **loginTimer()**: kirjaa käyttäjän ulos, jos token on vanhentunut
- **logoutUser()**: suorittaa uloskirjautumiseen liittyvät toimenpiteet

Lisäksi käytössä on useita tapahtumakäsittelijöitä, joiden avulla käyttäjä voi mm. rekisteröityä, kirjautua sisään ja ulos, muokata käyttäjätietoja sekä sulkea ikkunat.

## Ajan käyttö

Sovelluksen tekemiseen on käytetty arviolta 75 tuntia. Suurin osa ajasta on mennyt JavaScript-koodin kirjoittamiseen ja korjaamiseen. Sijaintitiedon hyödyntäminen web-sovelluksessa oli uutta, joten siihen piti perehtyä erityisesti. Viimeinen haaste ennen ensimmäisen version julkaisemista oli ilmoituslomakkeen muokkaaminen dynaamiseksi niin, että samaa nappia voi käyttää sekä uuden ilmoituksen luomiseen että vanhan muokkaamiseen. Tähän upposi aikaa, vaikka ratkaisu oli lopulta yksinkertainen.

## Jatkokehitys

Tällaisenaan sovellus on "karvahattuversio", jossa on perustoiminnallisuudet. Jatkoa ajatellen sovelluksen kehitys olisi järkevää toteuttaa JS-kehyksen avulla. Tämä tehostaisi koodausta, parantaisi sovelluksen suorituskykyä ja mahdollistaisi monipuolisemman toiminnallisuuden.

Sovellukseen voisi toki jo nyt tehdä monia pieniä parannuksia, esimerkiksi järjestää ilmoitukset julkaisuajankohdan mukaan uusimmasta vanhimpaan. Käyttäjillä voisi olla myös laajemmat mahdollisuudet ilmoitusten käsittelyyn.

Käyttäjäkokemuksen kannalta tärkein kehitysaskel olisi mahdollistaa sovelluksen sisäinen viestintä reaaliaikaisesti.
