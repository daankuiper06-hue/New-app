# Historische bedragen

Historische kwitanties worden als opgeslagen samenvattingen weergegeven, met de oorspronkelijke datum, klant, klus, subtotaal, btw-bedrag, totaal en urenkeuze. Ze worden niet opnieuw berekend uit later gewijzigde klusregels. Een opgeslagen btw-bedrag van nul wordt niet als bewijs voor een btw-tarief gebruikt.

Als btw-basis of arbeidstype ontbreekt, toont het dashboard 'Niet vastgesteld' in plaats van nul. Waar mogelijk wordt bij een klus het laatste opgeslagen kwitantiebedrag getoond met een expliciet label. Oude regels en bibliotheekproducten behouden hun onbekende prijsbasis bij bewerken/kopiëren, in plaats van automatisch exclusief btw te kiezen. Nieuwe berekeningen ondersteunen verschillende prijsbases per regel.

Validatie: 18 tests geslaagd, waaronder historische documenttotalen, ontbrekende bedragen versus nul, gemengde btw-bases en daadwerkelijke formulierweergave met ontbrekende historische instellingen. JavaScript-syntax en statische build gecontroleerd. Er zijn voor deze aanpassing geen bestaande databasebedragen of prijsbasisvelden gewijzigd.
