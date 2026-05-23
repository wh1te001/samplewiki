-- Seed data: users, artists, albums, tracks, samples
USE `samplewiki`;

-- Insert a seed user
INSERT INTO `Users` (`Username`, `Email`, `PasswordHash`, `Role`, `IsActive`)
VALUES ('seeduser', 'seed@example.com', 'seed_password_hash', 1, 1);
SET @userId = LAST_INSERT_ID();

-- Insert Daft Punk and albums
INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Daft Punk', 'French electronic music duo', 'https://en.wikipedia.org/wiki/Daft_Punk');
SET @daftId = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Discovery', 2001, 'Breakthrough album by Daft Punk', @daftId),
('Random Access Memories', 2013, 'Grammy-winning album', @daftId);
SET @daftAlbumDiscovery = @@IDENTITY; -- not reliable in MySQL, will set below per-row

-- Capture album IDs explicitly by inserting one-by-one
-- Re-insert Discovery and RAM with explicit LAST_INSERT_ID capture for reliability
DELETE FROM `Albums` WHERE `ArtistId` = @daftId;

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Discovery', 2001, 'Breakthrough album by Daft Punk', @daftId);
SET @daftAlbumDiscovery = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Random Access Memories', 2013, 'Grammy-winning album', @daftId);
SET @daftAlbumRAM = LAST_INSERT_ID();

-- Insert Daft Punk track (original)
INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Harder, Better, Faster, Stronger', 224, 4, 'Electronic', @daftAlbumDiscovery, @daftId, @userId);
SET @daftTrackHBFS = LAST_INSERT_ID();

-- Insert Kanye West and albums
INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Kanye West', 'American rapper, singer, songwriter and record producer', 'https://en.wikipedia.org/wiki/Kanye_West');
SET @kanyeId = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Graduation', 2007, 'Third studio album by Kanye West', @kanyeId);
SET @kanyeAlbumGraduation = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('My Beautiful Dark Twisted Fantasy', 2010, 'Critically acclaimed album', @kanyeId);
SET @kanyeAlbumMBDTF = LAST_INSERT_ID();

-- Insert Kanye track that uses the sample
INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Stronger', 311, 1, 'Hip-Hop', @kanyeAlbumGraduation, @kanyeId, @userId);
SET @kanyeTrackStronger = LAST_INSERT_ID();

-- Insert a Sample: Kanye's 'Stronger' contains a sample from Daft Punk's 'Harder, Better, Faster, Stronger'
INSERT INTO `Samples` (`Title`, `Type`, `Description`, `Platform`, `PlatformId`, `StartTime`, `EndTime`, `TrackId`)
VALUES (
  'Harder, Better, Faster, Stronger (sample in Stronger)',
  0,
  'Kanye West''s "Stronger" prominently samples Daft Punk''s "Harder, Better, Faster, Stronger"',
  0,
  'YOUTUBE_ID_EXAMPLE',
  '00:00:00',
  '00:00:10',
  @kanyeTrackStronger
);
SET @sample1 = LAST_INSERT_ID();

-- Optional: insert Artwork entries (album covers)
INSERT INTO `Artworks` (`Title`, `ImageUrl`, `Description`, `AlbumId`) VALUES
('Discovery Cover', 'https://example.com/discovery.jpg', 'Album cover for Discovery', @daftAlbumDiscovery),
('Graduation Cover', 'https://example.com/graduation.jpg', 'Album cover for Graduation', @kanyeAlbumGraduation);

-- Done
SELECT 'Seed data inserted' AS Message, @userId AS SeedUser, @daftId AS DaftId, @daftAlbumDiscovery AS DaftDiscoveryAlbum, @daftTrackHBFS AS DaftTrackHBFS, @kanyeId AS KanyeId, @kanyeAlbumGraduation AS KanyeGraduationAlbum, @kanyeTrackStronger AS KanyeStrongerTrack, @sample1 AS SampleId;
