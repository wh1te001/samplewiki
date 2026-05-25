USE `samplewiki`;

INSERT INTO `Users` (`Username`, `Email`, `PasswordHash`, `Role`, `IsActive`)
VALUES ('seeduser', 'seed@example.com', '$2a$11$K4YfGqJ1e4YHIpRHiFJY0uUq0l0v0z0y0w0x0v0u0t0s0r0q0p0o0n0m0l0', 1, 1);
SET @userId = LAST_INSERT_ID();

-- ==================== ARTISTS ====================
INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Daft Punk', 'French electronic music duo', 'https://en.wikipedia.org/wiki/Daft_Punk');
SET @daftId = LAST_INSERT_ID();

INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Kanye West', 'American rapper, singer, songwriter and record producer', 'https://en.wikipedia.org/wiki/Kanye_West');
SET @kanyeId = LAST_INSERT_ID();

INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('King Crimson', 'English progressive rock band', 'https://en.wikipedia.org/wiki/King_Crimson');
SET @kingCrimsonId = LAST_INSERT_ID();

INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Volcano Choir', 'American indie folk band', 'https://en.wikipedia.org/wiki/Volcano_Choir');
SET @volcanoChoirId = LAST_INSERT_ID();

INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('George Duke', 'American jazz pianist and composer', 'https://en.wikipedia.org/wiki/George_Duke');
SET @georgeDukeId = LAST_INSERT_ID();

-- ==================== ALBUMS ====================
INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Discovery', 2001, 'Breakthrough album by Daft Punk', @daftId);
SET @daftAlbumDiscovery = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Random Access Memories', 2013, 'Grammy-winning album', @daftId);
SET @daftAlbumRAM = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Graduation', 2007, 'Third studio album by Kanye West', @kanyeId);
SET @kanyeAlbumGraduation = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('My Beautiful Dark Twisted Fantasy', 2010, 'Critically acclaimed album', @kanyeId);
SET @kanyeAlbumMBDTF = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('In the Court of the Crimson King', 1969, 'Debut album by King Crimson', @kingCrimsonId);
SET @kingCrimsonAlbum = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Unmap', 2009, 'Debut album by Volcano Choir', @volcanoChoirId);
SET @volcanoChoirAlbum = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Dream On', 1982, 'Album by George Duke', @georgeDukeId);
SET @georgeDukeAlbum = LAST_INSERT_ID();

-- ==================== TRACKS ====================
INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Harder, Better, Faster, Stronger', 224, 4, 'Electronic', 'https://www.youtube.com/watch?v=gAjR4_CbPpQ', @daftAlbumDiscovery, @daftId, @userId);
SET @daftTrackHBFS = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Digital Love', 300, 5, 'Electronic', 'https://www.youtube.com/watch?v=FxzBvqY5PP0', @daftAlbumDiscovery, @daftId, @userId);
SET @daftTrackDigitalLove = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Get Lucky', 369, 1, 'Funk', 'https://www.youtube.com/watch?v=5NV6Rdv1a3I', @daftAlbumRAM, @daftId, @userId);
SET @daftTrackGetLucky = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Stronger', 311, 1, 'Hip-Hop', 'https://www.youtube.com/watch?v=PsO6ZnUZI0g', @kanyeAlbumGraduation, @kanyeId, @userId);
SET @kanyeTrackStronger = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Power', 292, 1, 'Hip-Hop', 'https://www.youtube.com/watch?v=L53gjP-TtGE', @kanyeAlbumMBDTF, @kanyeId, @userId);
SET @kanyeTrackPower = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Runaway', 543, 9, 'Hip-Hop', 'https://www.youtube.com/watch?v=Bm5iA4Zupek', @kanyeAlbumMBDTF, @kanyeId, @userId);
SET @kanyeTrackRunaway = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('21st Century Schizoid Man', 441, 1, 'Progressive Rock', 'https://www.youtube.com/watch?v=7OvW8Z7kiws', @kingCrimsonAlbum, @kingCrimsonId, @userId);
SET @kingCrimsonTrackSchizoid = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Still', 268, 3, 'Indie Folk', NULL, @volcanoChoirAlbum, @volcanoChoirId, @userId);
SET @volcanoChoirTrackStill = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('I Love You More', 248, 2, 'Jazz Funk', 'https://www.youtube.com/watch?v=IEibygqqLZc', @georgeDukeAlbum, @georgeDukeId, @userId);
SET @georgeDukeTrackILoveYouMore = LAST_INSERT_ID();

-- ==================== SAMPLES ====================
-- Stronger samples HBFS by Daft Punk
INSERT INTO `Samples` (`Type`, `Description`, `StartTimeSeconds`, `TrackId`, `SampledTrackId`) VALUES
(0, 'Kanye West''s "Stronger" prominently samples the vocal hook from Daft Punk''s "Harder, Better, Faster, Stronger".',
 15, @kanyeTrackStronger, @daftTrackHBFS);

-- Power samples 21st Century Schizoid Man by King Crimson
INSERT INTO `Samples` (`Type`, `Description`, `StartTimeSeconds`, `TrackId`, `SampledTrackId`) VALUES
(0, 'Kanye West''s "Power" samples the iconic guitar riff from King Crimson''s "21st Century Schizoid Man" (1969).',
 0, @kanyeTrackPower, @kingCrimsonTrackSchizoid);

-- Runaway interpolates Still by Volcano Choir
INSERT INTO `Samples` (`Type`, `Description`, `StartTimeSeconds`, `TrackId`, `SampledTrackId`) VALUES
(1, '"Runaway" uses an interpolation of the vocal melody from Volcano Choir''s "Still".',
 NULL, @kanyeTrackRunaway, @volcanoChoirTrackStill);

-- Digital Love samples I Love You More by George Duke
INSERT INTO `Samples` (`Type`, `Description`, `StartTimeSeconds`, `TrackId`, `SampledTrackId`) VALUES
(0, 'Daft Punk''s "Digital Love" samples the piano riff from George Duke''s "I Love You More" (1982).',
 5, @daftTrackDigitalLove, @georgeDukeTrackILoveYouMore);

-- ==================== ARTWORKS ====================
INSERT INTO `Artworks` (`Title`, `ImageUrl`, `Description`, `AlbumId`) VALUES
('Discovery Cover', 'https://upload.wikimedia.org/wikipedia/en/8/86/DaftPunkDiscovery.jpg', 'Album cover for Discovery', @daftAlbumDiscovery),
('Random Access Memories Cover', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg', 'Album cover for Random Access Memories', @daftAlbumRAM),
('Graduation Bear Cover', 'https://upload.wikimedia.org/wikipedia/en/7/70/Kanye_West_-_Graduation.jpg', 'Album cover for Graduation', @kanyeAlbumGraduation),
('MBDTF Cover', 'https://upload.wikimedia.org/wikipedia/en/6/6b/My_Beautiful_Dark_Twisted_Fantasy.jpg', 'Album cover for My Beautiful Dark Twisted Fantasy', @kanyeAlbumMBDTF),
('In the Court of the Crimson King Cover', 'https://upload.wikimedia.org/wikipedia/en/2/2b/In_the_Court_of_the_Crimson_King_album_cover.jpg', 'Album cover for In the Court of the Crimson King', @kingCrimsonAlbum);

SELECT 'Seed data inserted successfully' AS Message;
