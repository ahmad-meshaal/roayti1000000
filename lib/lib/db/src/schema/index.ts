import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const usersTable = pgTable('users', {
  uid: text('uid').primaryKey(),
  displayName: text('display_name').notNull().default('كاتب مجهول'),
  username: text('username').unique(),
  email: text('email').notNull().default(''),
  photoURL: text('photo_url').default(''),
  bannerURL: text('banner_url').default(''),
  bio: text('bio').default(''),
  role: text('role').default('user'),
  fontFamily: text('font_family').default(''),
  teraboxLink: text('terabox_link').default(''),
  showCloudAssetsPublicly: boolean('show_cloud_assets_publicly').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  links: jsonb('links').default('[]'),
  manualBadge: text('manual_badge'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const novelsTable = pgTable('novels', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').default(''),
  authorPhoto: text('author_photo').default(''),
  title: text('title').notNull(),
  genre: text('genre').default('drama'),
  summary: text('summary').default(''),
  coverImage: text('cover_image').default(''),
  status: text('status').default('draft'),
  likesCount: integer('likes_count').default(0),
  viewsCount: integer('views_count').default(0),
  sharesCount: integer('shares_count').default(0),
  language: text('language').default('ar'),
  violenceLevel: text('violence_level').default('none'),
  moralTone: text('moral_tone').default('neutral'),
  fontFamily: text('font_family').default('var(--font-serif)'),
  fontSize: text('font_size').default('1.125rem'),
  textAlign: text('text_align').default('right'),
  lineHeight: text('line_height').default('1.75'),
  previousPartId: text('previous_part_id'),
  teraboxLink: text('terabox_link').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chaptersTable = pgTable('chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  novelId: text('novel_id').notNull(),
  title: text('title').notNull(),
  content: text('content').default(''),
  description: text('description').default(''),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const charactersTable = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  novelId: text('novel_id').notNull(),
  name: text('name').notNull(),
  role: text('role').default('supporting'),
  traits: text('traits').default(''),
  description: text('description').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const worldNotesTable = pgTable('world_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  novelId: text('novel_id').notNull(),
  title: text('title').notNull(),
  category: text('category').default('other'),
  content: text('content').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const followsTable = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerUid: text('follower_uid').notNull(),
  followedUid: text('followed_uid').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [unique().on(t.followerUid, t.followedUid)]);

export const libraryTable = pgTable('library', {
  id: uuid('id').primaryKey().defaultRandom(),
  uid: text('uid').notNull(),
  novelId: text('novel_id').notNull(),
  addedAt: timestamp('added_at').defaultNow(),
}, (t) => [unique().on(t.uid, t.novelId)]);

export const readingProgressTable = pgTable('reading_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  uid: text('uid').notNull(),
  novelId: text('novel_id').notNull(),
  lastChapterId: text('last_chapter_id').notNull(),
  lastChapterOrder: integer('last_chapter_order').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [unique().on(t.uid, t.novelId)]);

export const commentsTable = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  novelId: text('novel_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').notNull().default(''),
  authorPhoto: text('author_photo').default(''),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const likesTable = pgTable('likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  novelId: text('novel_id').notNull(),
  uid: text('uid').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [unique().on(t.novelId, t.uid)]);

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  uid: text('uid').notNull(),
  type: text('type').default('general'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const insertNovelSchema = createInsertSchema(novelsTable).omit({ id: true });
export const insertChapterSchema = createInsertSchema(chaptersTable).omit({ id: true });
export const insertCharacterSchema = createInsertSchema(charactersTable).omit({ id: true });
export const insertFollowSchema = createInsertSchema(followsTable).omit({ id: true });
export const insertLibrarySchema = createInsertSchema(libraryTable).omit({ id: true });
export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true });

export type User = typeof usersTable.$inferSelect;
export type Novel = typeof novelsTable.$inferSelect;
export type Chapter = typeof chaptersTable.$inferSelect;
export type Character = typeof charactersTable.$inferSelect;
export type Follow = typeof followsTable.$inferSelect;
export type LibraryItem = typeof libraryTable.$inferSelect;
export type ReadingProgress = typeof readingProgressTable.$inferSelect;
export type Comment = typeof commentsTable.$inferSelect;
