# Databaseacceptatie

De migratie voor de nieuwe document- en instellingenrecords is toegepast. De controle op dubbele documentnummers is toegevoegd.

Databasetests voor lezen, opslaan, bijwerken en weigeren van dubbele documentnummers zijn geslaagd. De tests zijn in een transactie teruggedraaid. Bestaande gegevens zijn ongewijzigd gebleven.

Voor vrijgave blijven de browserlogin, eind-tot-eindcontrole, mobiele/afdrukacceptatie en toegang tot de hostingomgeving nodig. Er is nog geen Cloudflare-publicatie uitgevoerd.
