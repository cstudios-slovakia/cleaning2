# entities

## property
definition: property is the hotel where the rooms are. each install can have multiple properties. Properties have rooms
values
*   name - sting - the name of the propery
*   color theme - two colors in hex - used as basics for interface elements when property is managed
*   cover image - used on the card of the propery selection
*   logo - svg or png showing the property logo
*   managers - which user are the property managers
*   cleaners - which cleaner class user can see the property

## room
definition: room is one unit which has to be cleaned. it has cleaning task assigments.
values:
*   name - just the string
*   next cleaning - datetime - the date when the next cleaning needs to be done
*   task list - it is an array which populates a cleaning tasks
*   property - a property where the room is
*   auto intervall - number in days how often the room must be cleaned - if null (no value) it does not instantiate a next cleaning assigment automaticaly when the previous was done

## cleaning task assigment
definition: the cleaning task is a list of tasks needs to be cleaned in the room. it is used to check what has been done or what not. closed assigments are used as a log
*   room - which room needs to do the task
*   task list - an instantiated list from the rooms task list, where each task is marked as done or not. I would use a JSON format for a field.
*   assigment created by - a user (usually the manager, but can be a cleaner) who did create the task
*   done by - user who closed the task assigment (not all the tasks needs to be done in order to close the assigment) - if this value is null, the task is not assigned
*   closed time - datetime when the assigment was done
*   created time - datetime when the assigment was created
*   immediate cleaning - boolean - if it was instantied by the button for immediate cleaning

## user
user is the entity who logs in. it can be:
*   cleaner - uses name and pin to log in, can close cleaning assigments, can initiate immediate cleanings
*   manager - can do everything cleaners can, but also add rooms to properties, registed cleaners but NOT managers - logs in using email and password
*   owners - can do everything what managers can do, and add properties, and registed managers. - logs in using email and passwor
*   admin - can do everything - logs in using email and passwor
