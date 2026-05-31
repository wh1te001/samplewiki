USE `samplewiki`;

-- Пароль для admin: Admin@123 (BCrypt hash, удовлетворяет требованиям сложности)
-- Пароль для seeduser: User@test1
INSERT INTO `Users` (`Username`, `Email`, `PasswordHash`, `Role`, `IsActive`) VALUES
('admin', 'admin@samplewiki.local', '$2a$11$xzaiHGSKAcFo0cVBxqMLwu303XeYessZj3FU0tFVDZscqnhmwkaY2', 2, 1),
('seeduser', 'seed@example.com', '$2a$11$FN5DOxn1/w6isjdVO43sWOHT5MOoa.qHExQViGvKb1g1Q0wwGKhXO', 1, 1);
SET @userId = (SELECT `Id` FROM `Users` WHERE `Username` = 'seeduser');

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
INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('Discovery', 2001, @daftId);
SET @daftAlbumDiscovery = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('Random Access Memories', 2013, @daftId);
SET @daftAlbumRAM = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('Graduation', 2007, @kanyeId);
SET @kanyeAlbumGraduation = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('My Beautiful Dark Twisted Fantasy', 2010, @kanyeId);
SET @kanyeAlbumMBDTF = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('In the Court of the Crimson King', 1969, @kingCrimsonId);
SET @kingCrimsonAlbum = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('Unmap', 2009, @volcanoChoirId);
SET @volcanoChoirAlbum = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `ArtistId`) VALUES
('Dream On', 1982, @georgeDukeId);
SET @georgeDukeAlbum = LAST_INSERT_ID();

-- ==================== TRACKS ====================
INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Harder, Better, Faster, Stronger', 4, 'Electronic', 'https://www.youtube.com/watch?v=gAjR4_CbPpQ', @daftAlbumDiscovery, @daftId, @userId);
SET @daftTrackHBFS = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Digital Love', 5, 'Electronic', 'https://www.youtube.com/watch?v=FxzBvqY5PP0', @daftAlbumDiscovery, @daftId, @userId);
SET @daftTrackDigitalLove = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Get Lucky', 1, 'Funk', 'https://www.youtube.com/watch?v=5NV6Rdv1a3I', @daftAlbumRAM, @daftId, @userId);
SET @daftTrackGetLucky = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Stronger', 1, 'Hip-Hop', 'https://www.youtube.com/watch?v=PsO6ZnUZI0g', @kanyeAlbumGraduation, @kanyeId, @userId);
SET @kanyeTrackStronger = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Power', 1, 'Hip-Hop', 'https://www.youtube.com/watch?v=L53gjP-TtGE', @kanyeAlbumMBDTF, @kanyeId, @userId);
SET @kanyeTrackPower = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Runaway', 9, 'Hip-Hop', 'https://www.youtube.com/watch?v=Bm5iA4Zupek', @kanyeAlbumMBDTF, @kanyeId, @userId);
SET @kanyeTrackRunaway = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('21st Century Schizoid Man', 1, 'Progressive Rock', 'https://www.youtube.com/watch?v=7OvW8Z7kiws', @kingCrimsonAlbum, @kingCrimsonId, @userId);
SET @kingCrimsonTrackSchizoid = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('Still', 3, 'Indie Folk', NULL, @volcanoChoirAlbum, @volcanoChoirId, @userId);
SET @volcanoChoirTrackStill = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES ('I Love You More', 2, 'Jazz Funk', 'https://www.youtube.com/watch?v=IEibygqqLZc', @georgeDukeAlbum, @georgeDukeId, @userId);
SET @georgeDukeTrackILoveYouMore = LAST_INSERT_ID();

-- ==================== SAMPLES ====================
INSERT INTO `Samples` (`Type`, `StartTimeSeconds`, `TrackId`, `SampledTrackId`) VALUES
(0, 15, @kanyeTrackStronger, @daftTrackHBFS),
(0, 0, @kanyeTrackPower, @kingCrimsonTrackSchizoid),
(1, NULL, @kanyeTrackRunaway, @volcanoChoirTrackStill),
(0, 5, @daftTrackDigitalLove, @georgeDukeTrackILoveYouMore);

-- ==================== ARTWORKS ====================
INSERT INTO `Artworks` (`Title`, `ImageUrl`, `Description`, `AlbumId`) VALUES
('Discovery Cover', 'https://upload.wikimedia.org/wikipedia/en/8/86/DaftPunkDiscovery.jpg', 'Album cover for Discovery', @daftAlbumDiscovery),
('Random Access Memories Cover', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg', 'Album cover for Random Access Memories', @daftAlbumRAM),
('Graduation Bear Cover', 'https://upload.wikimedia.org/wikipedia/en/7/70/Kanye_West_-_Graduation.jpg', 'Album cover for Graduation', @kanyeAlbumGraduation),
('MBDTF Cover', 'https://upload.wikimedia.org/wikipedia/en/6/6b/My_Beautiful_Dark_Twisted_Fantasy.jpg', 'Album cover for My Beautiful Dark Twisted Fantasy', @kanyeAlbumMBDTF),
('In the Court of the Crimson King Cover', 'https://upload.wikimedia.org/wikipedia/en/2/2b/In_the_Court_of_the_Crimson_King_album_cover.jpg', 'Album cover for In the Court of the Crimson King', @kingCrimsonAlbum);

SELECT 'Seed data inserted successfully' AS Message;
