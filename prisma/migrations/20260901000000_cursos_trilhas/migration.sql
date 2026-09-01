-- Cursos da Move: trilhas, cursos, modulos, aulas, progresso e quiz.

CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");

CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "level" TEXT NOT NULL DEFAULT 'INICIANTE',
    "area" TEXT,
    "cover" TEXT NOT NULL DEFAULT 'laranja',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

CREATE TABLE "CourseTrack" (
    "courseId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CourseTrack_pkey" PRIMARY KEY ("courseId","trackId")
);

CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL DEFAULT 'INICIANTE',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "materialUrl" TEXT,
    "durationMin" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT,
    "level" TEXT NOT NULL DEFAULT 'INICIANTE',
    "answers" TEXT NOT NULL DEFAULT '{}',
    "scores" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuizResult_userId_key" ON "QuizResult"("userId");

ALTER TABLE "CourseTrack" ADD CONSTRAINT "CourseTrack_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseTrack" ADD CONSTRAINT "CourseTrack_trackId_fkey"
    FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey"
    FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_trackId_fkey"
    FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;
