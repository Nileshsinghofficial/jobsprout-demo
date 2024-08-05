--
-- Table structure for table `admins`
--

CREATE TABLE "admins" (
  "id" SERIAL NOT NULL,
  "username" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("username")
);

--
-- Table structure for table `jobs`
--

CREATE TABLE "jobs" (
  "id" SERIAL NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "author" VARCHAR(255) NOT NULL,
  PRIMARY KEY ("id")
);

--
-- Table structure for table `users`
--

CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "username" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "checkbox" BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY ("id"),
  UNIQUE ("username")
);

--
-- Table structure for table `applications`
--

CREATE TABLE "applications" (
  "id" SERIAL NOT NULL,
  "job_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("job_id", "user_id"),
  FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX "applications_user_id" ON "applications" ("user_id");

--
-- Table structure for table `session`
--

CREATE TABLE "session" (
  "sid" VARCHAR NOT NULL,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  PRIMARY KEY ("sid")
);

--
-- Dumping data for table `admins`
--

INSERT INTO "admins" ("id","username","password") VALUES (1,'admin','$2b$10$cqptQ9KG4MY/oJ145/iewOsCW03JRUp2s4lKA2vCcX/B6H1bdK8Ze');
INSERT INTO "admins" ("id","username","password") VALUES (3,'nilesh','$2a$10$LRjmGj.Be3I/N4Mt5HcBa.3LYHRL2696cNafLeckNUuFfBhfQc29.');
INSERT INTO "admins" ("id","username","password") VALUES (6,'nigam','$2a$10$DbGMYTACLLrXduC.yRKvP.i0iXjhb8LAI0CW35pacD5OjTeayKlAG');
INSERT INTO "admins" ("id","username","password") VALUES (7,'root','$2a$10$FEqM7XIkMZcdnkvsx1O0..GNXn5nW8GPhKma6v2QpH9MPlIKRmRQK');

SELECT setval('public."admins_id_seq"', max("id") ) FROM "admins";

--
-- Dumping data for table `jobs`
--

INSERT INTO "jobs" ("id","title","description","author") VALUES (1,'Software Engineer','Develop and maintain software applications','Google');
INSERT INTO "jobs" ("id","title","description","author") VALUES (2,'Software Engineer','Develop and maintain software applications','Facebook');
INSERT INTO "jobs" ("id","title","description","author") VALUES (3,'data analysist','IBM provide this ','IBM');
INSERT INTO "jobs" ("id","title","description","author") VALUES (5,'Software Engineer','Develop and maintain software applications','Amazon');
INSERT INTO "jobs" ("id","title","description","author") VALUES (6,'Infosys','System Analysist','Infosys');
INSERT INTO "jobs" ("id","title","description","author") VALUES (7,'Data Analysis','Fresher Job For Data Analysis.','TCS');

SELECT setval('public."jobs_id_seq"', max("id") ) FROM "jobs";

--
-- Dumping data for table `users`
--

INSERT INTO "users" ("id","username","password","checkbox") VALUES (1,'nigamsingh888@gmail.com','$2b$10$mh1M2ZJAg/QwAQQ09vBTOODyqlf1r6ZMjqKZZmvQOnIEzEk.X1Rb6','true');
INSERT INTO "users" ("id","username","password","checkbox") VALUES (5,'Nigam','$2b$10$yQKJCGpS/z8GE0Y1yMqBX.9zO9wBDJmmrR75WaWoXuN9.M/g4COKq','true');

SELECT setval('public."users_id_seq"', max("id") ) FROM "users";

--
-- Dumping data for table `applications`
--

INSERT INTO "applications" ("id","job_id","user_id") VALUES (11,3,5);
INSERT INTO "applications" ("id","job_id","user_id") VALUES (12,1,5);
INSERT INTO "applications" ("id","job_id","user_id") VALUES (16,2,5);

SELECT setval('public."applications_id_seq"', max("id") ) FROM "applications";
