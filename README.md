# Campus Lost & Found Matching System

A beginner-friendly Java OOP mini-project with a website frontend, REST API backend, and file-based H2 database.

## Requirements
- Java 21 (JDK)
- Maven 3.9+ (or use an IDE with Maven support)
- Internet on the first build so Maven can download dependencies

## Run in IntelliJ IDEA / Eclipse
1. Extract the ZIP.
2. Open the extracted `campus-lost-found` folder as a Maven project.
3. Ensure the project SDK/JDK is Java 21.
4. Run `src/main/java/edu/campus/lostfound/LostFoundApplication.java`.
5. Wait for the console to say the application has started.
6. Open `http://localhost:8080` in your browser.

## Run from a terminal
From the project folder:
```bash
mvn spring-boot:run
```
Then visit `http://localhost:8080`.

## Features
- Create LOST and FOUND reports
- Search by name, category, location, or description
- Filter by LOST / FOUND
- Suggest possible matches based on item name, category, and location
- Mark a report as resolved
- Delete a report
- Dashboard counts
- Persistent local database (stored in `./data/lostfounddb`)

## How frontend and backend connect
The frontend files (`index.html`, `styles.css`, `app.js`) are in Spring Boot's `static` folder. Spring serves them at `http://localhost:8080`.
The Java controller exposes REST endpoints under `/api/items`. `app.js` calls those endpoints using `fetch()`. For example:
- `GET /api/items` - list/search reports
- `POST /api/items` - create report
- `GET /api/items/matches` - find possible matches
- `PATCH /api/items/{id}/resolve` - mark resolved
- `DELETE /api/items/{id}` - delete report

Because the frontend and backend are served from the same Spring Boot app, no separate frontend server or CORS setup is needed.

## Data and privacy
The database is local to the machine running the application. This is a classroom prototype, not a production deployment. Before making it public, add authentication/authorization, moderation, rate limiting, secure contact handling, and appropriate data-retention controls. Do not use real sensitive personal information for demos.

## Matching note
Matching is a simple rule-based suggestion, not AI and not proof of ownership. It compares names, categories, and locations. Verify ownership manually before returning an item.

## Common issues
- `mvn: command not found`: install Maven, or run via an IDE's Maven integration.
- `Unsupported class file / Java version`: set the project JDK to Java 21.
- Port 8080 already in use: stop the other app using it or change `server.port` in `application.properties`.
- First run fails due network: Maven may need internet to download dependencies; retry after connecting.
