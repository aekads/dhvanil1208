const db = require("../config/dbConnection");

const createPlaylist = async (playlistData) => {
  const {screenIDs,  playlistName, playlistDescription, urls } = playlistData;
  console.log("urls", urls);
    console.log("screenID", screenIDs);
    console.log("playlistName", playlistName);
    console.log("playlistDescription", playlistDescription);
  try {
    // Insert into playlists table
    const query = `
      INSERT INTO playlists ( screen_id,playlistname, playlistdescription, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13)
      RETURNING *;
    `;
    const values = [
      screenIDs,
      playlistName,
      playlistDescription,
      urls[0] || null,
      urls[1] || null,
      urls[2] || null,
      urls[3] || null,
      urls[4] || null,
      urls[5] || null,
      urls[6] || null,
      urls[7] || null,
      urls[8] || null,
      urls[9] || null,
    ];

    // Execute query and return newly created playlist
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw new Error('Error creating playlist');
  }
};


const editPlaylist = async (playlistData) => {
  const {screenIDs,  playlistName, playlistDescription, urls,playlistId } = playlistData;
  console.log("urls", urls);
  console.log("screenID", screenIDs);
  console.log("playlistName", playlistName);
  console.log("playlistDescription", playlistDescription);

  try {
    // Update playlists table
    const query = `
      UPDATE playlists
      SET screen_id =$2,
          playlistname = $3,
          playlistdescription = $4, 
          slot1 = $5,
          slot2 =  $6,
          slot3 =  $7,
          slot4 =   $8, 
          slot5 =$9,
          slot6 =  $10,
          slot7 =  $11,
          slot8 =  $12, 
          slot9 = $13,
          slot10 = $14
      WHERE id=  $1
      RETURNING *;
    `;
    const values = [
      playlistId,
      screenIDs,
      playlistName,
      playlistDescription,
      urls[0] || null,
      urls[1] || null,
      urls[2] || null,
      urls[3] || null,
      urls[4] || null,
      urls[5] || null,
      urls[6] || null,
      urls[7] || null,
      urls[8] || null,
      urls[9] || null,
    ];

    // Execute query and return updated playlist
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw new Error('Error updating playlist');
  }
};


// const deletePlaylist = async (playlistData) => {
//   const {screenIDs,  playlistName, playlistDescription, urls,playlistId } = playlistData;
//   console.log("urls", urls);
//   console.log("screenID", screenIDs);
//   console.log("playlistName", playlistName);
//   console.log("playlistDescription", playlistDescription);

//   try {
//     // Update playlists table
//     const query = `
//       UPDATE playlists
//       SET screen_id =$2,
//           playlistname = $3,
//           playlistdescription = $4, 
//           slot1 = $5,
//           slot2 =  $6,
//           slot3 =  $7,
//           slot4 =   $8, 
//           slot5 =$9,
//           slot6 =  $10,
//           slot7 =  $11,
//           slot8 =  $12, 
//           slot9 = $13,
//           slot10 = $14
//       WHERE id=  $1
//       RETURNING *;
//     `;
//     const values = [
//       playlistId,
//       screenIDs,
//       playlistName,
//       playlistDescription,
//       urls[0] || null,
//       urls[1] || null,
//       urls[2] || null,
//       urls[3] || null,
//       urls[4] || null,
//       urls[5] || null,
//       urls[6] || null,
//       urls[7] || null,
//       urls[8] || null,
//       urls[9] || null,
//     ];

//     // Execute query and return updated playlist
//     const { rows } = await db.query(query, values);
//     return rows[0];
//   } catch (error) {
//     throw new Error('Error delete playlist');
//   }
// };


const deletePlaylist = async (playlistData) => {
  const { playlistId } = playlistData;

  try {
    // Update playlists table to set fields to null
    const query = `
      UPDATE playlists
      SET screen_id = NULL,
          playlistname = NULL,
          playlistdescription = NULL, 
          slot1 = NULL,
          slot2 = NULL,
          slot3 = NULL,
          slot4 = NULL,
          slot5 = NULL,
          slot6 = NULL,
          slot7 = NULL,
          slot8 = NULL,
          slot9 = NULL,
          slot10 = NULL
      WHERE id = $1
      RETURNING *;
    `;

    const values = [playlistId];

    // Execute query and return updated playlist
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw new Error('Error deleting playlist');
  }
};

// const deletePlaylistById = async (playlistId) => {
//   const query = `DELETE FROM playlists WHERE id = $1 RETURNING *`;
//   const { rows } = await db.query(query, [playlistId]);
//   return rows[0];
// };


const viewPlaylist=async()=>{
  try {
   const result = await db.query('SELECT * FROM playlists ORDER BY id DESC');
    return result.rows;
  } catch (error) {
    throw new Error('Error show playlist');
  }
}


const updateScreensWithPlaylist = async (screenIDs, playlistName, playlistDescription, urls) => {
  try {
    
    const updatePromises = screenIDs.map(async (screenID, index) => {
      const query = `
        UPDATE screens
        SET 
          playlistname = $1,
          playlistdescription = $2,
          slot1 = $3,
          slot2 = $4,
          slot3 = $5,
          slot4 = $6,
          slot5 = $7,
          slot6 = $8,
          slot7 = $9,
          slot8 = $10,
          slot9 = $11,
          slot10 = $12
        WHERE screenid = $13
      `;
      const values = [
        playlistName,
        playlistDescription,
        urls[0] || null,
        urls[1] || null,
        urls[2] || null,
        urls[3] || null,
        urls[4] || null,
        urls[5] || null,
        urls[6] || null,
        urls[7] || null,
        urls[8] || null,
        urls[9] || null,
        screenID,
      ];

      await db.query(query, values);
    });

    await Promise.all(updatePromises);
  
  } catch (error) {
    console.error("Error updating screens with playlist:", error);
    throw new Error("Failed to update screens with playlist");
  }
};

// const deleteScreensWithPlaylist = async (playlistData) => {
//   const {screenIDs,  playlistName, playlistDescription, urls } = playlistData;

//   try {
    
//     const updatePromises = screenIDs.map(async (screenID, index) => {
//       const query = `
//         UPDATE screens
//         SET 
//           playlistname = $1,
//           playlistdescription = $2,
//           slot1 = $3,
//           slot2 = $4,
//           slot3 = $5,
//           slot4 = $6,
//           slot5 = $7,
//           slot6 = $8,
//           slot7 = $9,
//           slot8 = $10,
//           slot9 = $11,
//           slot10 = $12
//         WHERE screenid = $13
//       `;
//       const values = [
//         playlistName,
//         playlistDescription,
//         urls[0] || null,
//         urls[1] || null,
//         urls[2] || null,
//         urls[3] || null,
//         urls[4] || null,
//         urls[5] || null,
//         urls[6] || null,
//         urls[7] || null,
//         urls[8] || null,
//         urls[9] || null,
//         screenID,
//       ];

//       await db.query(query, values);
//     });

//     await Promise.all(updatePromises);
  
//   } catch (error) {
//     console.error("Error deleted screens with playlist:", error);
//     throw new Error("Failed to delted screens with playlist");
//   }
// };


// const deleteScreensWithPlaylist = async (screenIDs) => {
//   try {
//     const updatePromises = screenIDs.map(async (screenID) => {
//       const query = `
//         UPDATE screens
//         SET 
//           playlistname = NULL,
//           playlistdescription = NULL,
//           slot1 = NULL,
//           slot2 = NULL,
//           slot3 = NULL,
//           slot4 = NULL,
//           slot5 = NULL,
//           slot6 = NULL,
//           slot7 = NULL,
//           slot8 = NULL,
//           slot9 = NULL,
//           slot10 = NULL
//         WHERE screenid = $1
//       `;
//       const values = [screenID];

//       await db.query(query, values);
//     });

//     await Promise.all(updatePromises);

//   } catch (error) {
//     console.error("Error deleting screens with playlist:", error);
//     throw new Error("Failed to delete screens with playlist");
//   }
// };


// const getScreenIDsByPlaylistId = async (playlistId) => {
//   const query = `SELECT screen_id FROM playlists WHERE id = $1`;
//   const { rows } = await db.query(query, [playlistId]);
  
//   if (rows.length === 0) {
//     return [];
//   }

//   const screenIDs = rows[0].screen_id;

//   // Remove curly braces and split by comma, then filter out non-numeric values
//   return screenIDs
//     .replace(/[{}]/g, '')
//     .split(',')
//     .map(id => id.trim())
//     .filter(id => !isNaN(id))
//     .map(id => parseInt(id, 10));
// };








const getScreenIDsByPlaylistId = async (playlistId) => {
  try {
    const query = `SELECT screen_id FROM playlists WHERE id = $1`;
    const { rows } = await db.query(query, [playlistId]);

    // Log the raw result from the database
    console.log("Raw rows from database:", rows);

    if (rows.length === 0) {
      return [];
    }

    const screenIDs = rows[0].screen_id;

    // Log the raw screenIDs value before processing
    console.log("Raw screen IDs:", screenIDs);

    // Remove curly braces, split by comma, trim quotes, and filter out non-numeric values
    const formattedScreenIDs = screenIDs
      .replace(/[{}]/g, '')
      .split(',')
      .map(id => id.replace(/"/g, '').trim())
      .filter(id => !isNaN(id))
      .map(id => parseInt(id, 10));

    // Log the formatted screen IDs
    console.log("Formatted Screen IDs:", formattedScreenIDs);

    return formattedScreenIDs;
  } catch (error) {
    console.error("Error fetching screen IDs:", error);
    throw new Error("Failed to fetch screen IDs");
  }
};


const deleteScreensWithPlaylist = async (screenIDs) => {
  try {
    const updatePromises = screenIDs.map(async (screenID) => {
      const query = `
        UPDATE screens
        SET 
          playlistname = NULL,
          playlistdescription = NULL,
          slot1 = NULL,
          slot2 = NULL,
          slot3 = NULL,
          slot4 = NULL,
          slot5 = NULL,
          slot6 = NULL,
          slot7 = NULL,
          slot8 = NULL,
          slot9 = NULL,
          slot10 = NULL
        WHERE screenid = $1
      `;
      await db.query(query, [screenID]);
    });

    await Promise.all(updatePromises);
    console.log("Screens updated successfully");
  } catch (error) {
    console.error("Error deleting screens with playlist:", error);
    throw new Error("Failed to delete screens with playlist");
  }
};

const deletePlaylistById = async (playlistId) => {
  try {
    const query = `DELETE FROM playlists WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [playlistId]);
    return rows[0];
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw new Error("Failed to delete playlist");
  }
};



const getPlaylistById = async (playlistId) => {
  try {
    const result = await db.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error fetching playlist');
  }
};













const abcd=async(playlistData)=>{
  const {screenIDs,  playlistName, playlistDescription, layoutData } = playlistData;
  console.log("layoutData", layoutData);
    console.log("screenID", screenIDs);
    console.log("playlistName", playlistName);
    console.log("playlistDescription", playlistDescription);


    try {
      await pool.query(
        `INSERT INTO playlists1235 (playlistname, playlistdescription, screen_id, 
          slot1, slot1_updatetime, slot1_deletetime, slot1_update_status, slot1_delete_status, 
          slot2, slot2_updatetime, slot2_deletetime, slot2_update_status, slot2_delete_status, 
          slot3, slot3_updatetime, slot3_deletetime, slot3_update_status, slot3_delete_status, 
          slot4, slot4_updatetime, slot4_deletetime, slot4_update_status, slot4_delete_status, 
          slot5, slot5_updatetime, slot5_deletetime, slot5_update_status, slot5_delete_status,
          slot6, slot6_updatetime, slot6_deletetime, slot6_update_status, slot6_delete_status,
  slot7, slot7_updatetime, slot7_deletetime, slot7_update_status, slot7_delete_status,
  slot8, slot8_updatetime, slot8_deletetime, slot8_update_status, slot8_delete_status,
  slot9, slot9_updatetime, slot9_deletetime, slot9_update_status, slot9_delete_status,
  slot10, slot10_updatetime, slot10_deletetime, slot10_update_status, slot10_delete_status,
  slot11, slot11_updatetime, slot11_deletetime, slot11_update_status, slot11_delete_status,
  slot12, slot12_updatetime, slot12_deletetime, slot12_update_status, slot12_delete_status,
  slot13, slot13_updatetime, slot13_deletetime, slot13_update_status, slot13_delete_status,
  slot14, slot14_updatetime, slot14_deletetime, slot14_update_status, slot14_delete_status,
  slot15, slot15_updatetime, slot15_deletetime, slot15_update_status, slot15_delete_status,
  slot16, slot16_updatetime, slot16_deletetime, slot16_update_status, slot16_delete_status,
  slot17, slot17_updatetime, slot17_deletetime, slot17_update_status, slot17_delete_status,
  slot18, slot18_updatetime, slot18_deletetime, slot18_update_status, slot18_delete_status,
  slot19, slot19_updatetime, slot19_deletetime, slot19_update_status, slot19_delete_status,
  slot20, slot20_updatetime, slot20_deletetime, slot20_update_status, slot20_delete_status,
  slot21, slot21_updatetime, slot21_deletetime, slot21_update_status, slot21_delete_status,
  slot22, slot22_updatetime, slot22_deletetime, slot22_update_status, slot22_delete_status,
  slot23, slot23_updatetime, slot23_deletetime, slot23_update_status, slot23_delete_status,
  slot24, slot24_updatetime, slot24_deletetime, slot24_update_status, slot24_delete_status,
  slot25, slot25_updatetime, slot25_deletetime, slot25_update_status, slot25_delete_status,
  slot26, slot26_updatetime, slot26_deletetime, slot26_update_status, slot26_delete_status,
  slot27, slot27_updatetime, slot27_deletetime, slot27_update_status, slot27_delete_status,
  slot28, slot28_updatetime, slot28_deletetime, slot28_update_status, slot28_delete_status,
  slot29, slot29_updatetime, slot29_deletetime, slot29_update_status, slot29_delete_status,
  slot30, slot30_updatetime, slot30_deletetime, slot30_update_status, slot30_delete_status,
  slot31, slot31_updatetime, slot31_deletetime, slot31_update_status, slot31_delete_status,
  slot32, slot32_updatetime, slot32_deletetime, slot32_update_status, slot32_delete_status,
  slot33, slot33_updatetime, slot33_deletetime, slot33_update_status, slot33_delete_status,
  slot34, slot34_updatetime, slot34_deletetime, slot34_update_status, slot34_delete_status,
  slot35, slot35_updatetime, slot35_deletetime, slot35_update_status, slot35_delete_status,
  slot36, slot36_updatetime, slot36_deletetime, slot36_update_status, slot36_delete_status,
  slot37, slot37_updatetime, slot37_deletetime, slot37_update_status, slot37_delete_status,
  slot38, slot38_updatetime, slot38_deletetime, slot38_update_status, slot38_delete_status,
  slot39, slot39_updatetime, slot39_deletetime, slot39_update_status, slot39_delete_status,
  slot40, slot40_updatetime, slot40_deletetime, slot40_update_status, slot40_delete_status,
  slot41, slot41_updatetime, slot41_deletetime, slot41_update_status, slot41_delete_status,
  slot42, slot42_updatetime, slot42_deletetime, slot42_update_status, slot42_delete_status,
  slot43, slot43_updatetime, slot43_deletetime, slot43_update_status, slot43_delete_status,
  slot44, slot44_updatetime, slot44_deletetime, slot44_update_status, slot44_delete_status,
  slot45, slot45_updatetime, slot45_deletetime, slot45_update_status, slot45_delete_status,
  slot46, slot46_updatetime, slot46_deletetime, slot46_update_status, slot46_delete_status,
  slot47, slot47_updatetime, slot47_deletetime, slot47_update_status, slot47_delete_status,
  slot48, slot48_updatetime, slot48_deletetime, slot48_update_status, slot48_delete_status,
  slot49, slot49_updatetime, slot49_deletetime, slot49_update_status, slot49_delete_status,
  slot50, slot50_updatetime, slot50_deletetime, slot50_update_status, slot50_delete_status,
  slot51, slot51_updatetime, slot51_deletetime, slot51_update_status, slot51_delete_status,
  slot52, slot52_updatetime, slot52_deletetime, slot52_update_status, slot52_delete_status,
  slot53, slot53_updatetime, slot53_deletetime, slot53_update_status, slot53_delete_status,
  slot54, slot54_updatetime, slot54_deletetime, slot54_update_status, slot54_delete_status,
  slot55, slot55_updatetime, slot55_deletetime, slot55_update_status, slot55_delete_status,
  slot56, slot56_updatetime, slot56_deletetime, slot56_update_status, slot56_delete_status,
  slot57, slot57_updatetime, slot57_deletetime, slot57_update_status, slot57_delete_status,
  slot58, slot58_updatetime, slot58_deletetime, slot58_update_status, slot58_delete_status,
  slot59, slot59_updatetime, slot59_deletetime, slot59_update_status, slot59_delete_status,
  slot60, slot60_updatetime, slot60_deletetime, slot60_update_status, slot60_delete_status,
  slot61, slot61_updatetime, slot61_deletetime, slot61_update_status, slot61_delete_status,
  slot62, slot62_updatetime, slot62_deletetime, slot62_update_status, slot62_delete_status,
  slot63, slot63_updatetime, slot63_deletetime, slot63_update_status, slot63_delete_status,
  slot64, slot64_updatetime, slot64_deletetime, slot64_update_status, slot64_delete_status,
  slot65, slot65_updatetime, slot65_deletetime, slot65_update_status, slot65_delete_status,
  slot66, slot66_updatetime, slot66_deletetime, slot66_update_status, slot66_delete_status,
  slot67, slot67_updatetime, slot67_deletetime, slot67_update_status, slot67_delete_status,
  slot68, slot68_updatetime, slot68_deletetime, slot68_update_status, slot68_delete_status,
  slot69, slot69_updatetime, slot69_deletetime, slot69_update_status, slot69_delete_status,
  slot70, slot70_updatetime, slot70_deletetime, slot70_update_status, slot70_delete_status,
  slot71, slot71_updatetime, slot71_deletetime, slot71_update_status, slot71_delete_status,
  slot72, slot72_updatetime, slot72_deletetime, slot72_update_status, slot72_delete_status,
  slot73, slot73_updatetime, slot73_deletetime, slot73_update_status, slot73_delete_status,
  slot74, slot74_updatetime, slot74_deletetime, slot74_update_status, slot74_delete_status,
  slot75, slot75_updatetime, slot75_deletetime, slot75_update_status, slot75_delete_status,
  slot76, slot76_updatetime, slot76_deletetime, slot76_update_status, slot76_delete_status,
  slot77, slot77_updatetime, slot77_deletetime, slot77_update_status, slot77_delete_status,
  slot78, slot78_updatetime, slot78_deletetime, slot78_update_status, slot78_delete_status,
  slot79, slot79_updatetime, slot79_deletetime, slot79_update_status, slot79_delete_status,
  slot80, slot80_updatetime, slot80_deletetime, slot80_update_status, slot80_delete_status,
  slot81, slot81_updatetime, slot81_deletetime, slot81_update_status, slot81_delete_status,
  slot82, slot82_updatetime, slot82_deletetime, slot82_update_status, slot82_delete_status,
  slot83, slot83_updatetime, slot83_deletetime, slot83_update_status, slot83_delete_status,
  slot84, slot84_updatetime, slot84_deletetime, slot84_update_status, slot84_delete_status,
  slot85, slot85_updatetime, slot85_deletetime, slot85_update_status, slot85_delete_status,
  slot86, slot86_updatetime, slot86_deletetime, slot86_update_status, slot86_delete_status,
  slot87, slot87_updatetime, slot87_deletetime, slot87_update_status, slot87_delete_status,
  slot88, slot88_updatetime, slot88_deletetime, slot88_update_status, slot88_delete_status,
  slot89, slot89_updatetime, slot89_deletetime, slot89_update_status, slot89_delete_status,
  slot90, slot90_updatetime, slot90_deletetime, slot90_update_status, slot90_delete_status,
  slot91, slot91_updatetime, slot91_deletetime, slot91_update_status, slot91_delete_status,
  slot92, slot92_updatetime, slot92_deletetime, slot92_update_status, slot92_delete_status,
  slot93, slot93_updatetime, slot93_deletetime, slot93_update_status, slot93_delete_status,
  slot94, slot94_updatetime, slot94_deletetime, slot94_update_status, slot94_delete_status,
  slot95, slot95_updatetime, slot95_deletetime, slot95_update_status, slot95_delete_status,
  slot96, slot96_updatetime, slot96_deletetime, slot96_update_status, slot96_delete_status,
  slot97, slot97_updatetime, slot97_deletetime, slot97_update_status, slot97_delete_status,
  slot98, slot98_updatetime, slot98_deletetime, slot98_update_status, slot98_delete_status,
  slot99, slot99_updatetime, slot99_deletetime, slot99_update_status, slot99_delete_status,
  slot100, slot100_updatetime, slot100_deletetime, slot100_update_status, slot100_delete_status,
   layout_1 ,
   layout_2 ,
   layout_3 ,
   layout_4 ,
   layout_5 ,
   layout_6 ,
   layout_7 ,
   layout_8 ,
   layout_9 ,
   layout_10 ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
  $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
  $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
  $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
  $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
  $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,
  $81, $82, $83, $84, $85, $86, $87, $88, $89, $90,
  $91, $92, $93, $94, $95, $96, $97, $98, $99, $100,
  $101, $102, $103, $104, $105, $106, $107, $108, $109, $110,
  $111, $112, $113, $114, $115, $116, $117, $118, $119, $120,
  $121, $122, $123, $124, $125, $126, $127, $128, $129, $130,
  $131, $132, $133, $134, $135, $136, $137, $138, $139, $140,
  $141, $142, $143, $144, $145, $146, $147, $148, $149, $150,
  $151, $152, $153, $154, $155, $156, $157, $158, $159, $160,
  $161, $162, $163, $164, $165, $166, $167, $168, $169, $170,
  $171, $172, $173, $174, $175, $176, $177, $178, $179, $180,
  $181, $182, $183, $184, $185, $186, $187, $188, $189, $190,
  $191, $192, $193, $194, $195, $196, $197, $198, $199, $200,
  $201, $202, $203, $204, $205, $206, $207, $208, $209, $210,
  $211, $212, $213, $214, $215, $216, $217, $218, $219, $220,
  $221, $222, $223, $224, $225, $226, $227, $228, $229, $230,
  $231, $232, $233, $234, $235, $236, $237, $238, $239, $240,
  $241, $242, $243, $244, $245, $246, $247, $248, $249, $250,
  $251, $252, $253, $254, $255, $256, $257, $258, $259, $260,
  $261, $262, $263, $264, $265, $266, $267, $268, $269, $270,
  $271, $272, $273, $274, $275, $276, $277, $278, $279, $280,
  $281, $282, $283, $284, $285, $286, $287, $288, $289, $290,
  $291, $292, $293, $294, $295, $296, $297, $298, $299, $300,
  $301, $302, $303, $304, $305, $306, $307, $308, $309, $310,
  $311, $312, $313, $314, $315, $316, $317, $318, $319, $320,
  $321, $322, $323, $324, $325, $326, $327, $328, $329, $330,
  $331, $332, $333, $334, $335, $336, $337, $338, $339, $340,
  $341, $342, $343, $344, $345, $346, $347, $348, $349, $350,
  $351, $352, $353, $354, $355, $356, $357, $358, $359, $360,
  $361, $362, $363, $364, $365, $366, $367, $368, $369, $370,
  $371, $372, $373, $374, $375, $376, $377, $378, $379, $380,
  $381, $382, $383, $384, $385, $386, $387, $388, $389, $390,
  $391, $392, $393, $394, $395, $396, $397, $398, $399, $400,
  $401, $402, $403, $404, $405, $406, $407, $408, $409, $410,
  $411, $412, $413, $414, $415, $416, $417, $418, $419, $420,
  $421, $422, $423, $424, $425, $426, $427, $428, $429, $430,
  $431, $432, $433, $434, $435, $436, $437, $438, $439, $440,
  $441, $442, $443, $444, $445, $446, $447, $448, $449, $450,
  $451, $452, $453, $454, $455, $456, $457, $458, $459, $460,
  $461, $462, $463, $464, $465, $466, $467, $468, $469, $470,
  $471, $472, $473, $474, $475, $476, $477, $478, $479, $480,
  $481, $482, $483, $484, $485, $486, $487, $488, $489, $490,
  $491, $492, $493, $494, $495, $496, $497, $498, $499, $500,
  $501, $502, $503, $504, $505, $506, $507, $508, $509, $510,
  $511, $512, $513)`,
        [
          playlistname,
          playlistdescription,
          `{${screenidArray.join(',')}}`,
          slot1,
          parseTimestamp(slot1_updatetime),
          parseTimestamp(slot1_deletetime),
          'pending',
          'pending',
          slot2,
          parseTimestamp(slot2_updatetime),
          parseTimestamp(slot2_deletetime),
          'pending',
          'pending',
          slot3,
          parseTimestamp(slot3_updatetime),
          parseTimestamp(slot3_deletetime),
          'pending',
          'pending',
          slot4,
          parseTimestamp(slot4_updatetime),
          parseTimestamp(slot4_deletetime),
          'pending',
          'pending',
          slot5,
          parseTimestamp(slot5_updatetime),
          parseTimestamp(slot5_deletetime),
          'pending',
          'pending',
          slot6,
  parseTimestamp(slot6_updatetime),
  parseTimestamp(slot6_deletetime),
  'pending',
  'pending',
  slot7,
  parseTimestamp(slot7_updatetime),
  parseTimestamp(slot7_deletetime),
  'pending',
  'pending',
  slot8,
  parseTimestamp(slot8_updatetime),
  parseTimestamp(slot8_deletetime),
  'pending',
  'pending',
  slot9,
  parseTimestamp(slot9_updatetime),
  parseTimestamp(slot9_deletetime),
  'pending',
  'pending',
  slot10,
  parseTimestamp(slot10_updatetime),
  parseTimestamp(slot10_deletetime),
  'pending',
  'pending',
  slot11,
  parseTimestamp(slot11_updatetime),
  parseTimestamp(slot11_deletetime),
  'pending',
  'pending',
  slot12,
  parseTimestamp(slot12_updatetime),
  parseTimestamp(slot12_deletetime),
  'pending',
  'pending',
  slot13,
  parseTimestamp(slot13_updatetime),
  parseTimestamp(slot13_deletetime),
  'pending',
  'pending',
  slot14,
  parseTimestamp(slot14_updatetime),
  parseTimestamp(slot14_deletetime),
  'pending',
  'pending',
  slot15,
  parseTimestamp(slot15_updatetime),
  parseTimestamp(slot15_deletetime),
  'pending',
  'pending',
  slot16,
  parseTimestamp(slot16_updatetime),
  parseTimestamp(slot16_deletetime),
  'pending',
  'pending',
  slot17,
  parseTimestamp(slot17_updatetime),
  parseTimestamp(slot17_deletetime),
  'pending',
  'pending',
  slot18,
  parseTimestamp(slot18_updatetime),
  parseTimestamp(slot18_deletetime),
  'pending',
  'pending',
  slot19,
  parseTimestamp(slot19_updatetime),
  parseTimestamp(slot19_deletetime),
  'pending',
  'pending',
  slot20,
  parseTimestamp(slot20_updatetime),
  parseTimestamp(slot20_deletetime),
  'pending',
  'pending',
  slot21,
  parseTimestamp(slot21_updatetime),
  parseTimestamp(slot21_deletetime),
  'pending',
  'pending',
  slot22,
  parseTimestamp(slot22_updatetime),
  parseTimestamp(slot22_deletetime),
  'pending',
  'pending',
  slot23,
  parseTimestamp(slot23_updatetime),
  parseTimestamp(slot23_deletetime),
  'pending',
  'pending',
  slot24,
  parseTimestamp(slot24_updatetime),
  parseTimestamp(slot24_deletetime),
  'pending',
  'pending',
  slot25,
  parseTimestamp(slot25_updatetime),
  parseTimestamp(slot25_deletetime),
  'pending',
  'pending',
  slot26,
  parseTimestamp(slot26_updatetime),
  parseTimestamp(slot26_deletetime),
  'pending',
  'pending',
  slot27,
  parseTimestamp(slot27_updatetime),
  parseTimestamp(slot27_deletetime),
  'pending',
  'pending',
  slot28,
  parseTimestamp(slot28_updatetime),
  parseTimestamp(slot28_deletetime),
  'pending',
  'pending',
  slot29,
  parseTimestamp(slot29_updatetime),
  parseTimestamp(slot29_deletetime),
  'pending',
  'pending',
  slot30,
  parseTimestamp(slot30_updatetime),
  parseTimestamp(slot30_deletetime),
  'pending',
  'pending',
  slot31,
  parseTimestamp(slot31_updatetime),
  parseTimestamp(slot31_deletetime),
  'pending',
  'pending',
  slot32,
  parseTimestamp(slot32_updatetime),
  parseTimestamp(slot32_deletetime),
  'pending',
  'pending',
  slot33,
  parseTimestamp(slot33_updatetime),
  parseTimestamp(slot33_deletetime),
  'pending',
  'pending',
  slot34,
  parseTimestamp(slot34_updatetime),
  parseTimestamp(slot34_deletetime),
  'pending',
  'pending',
  slot35,
  parseTimestamp(slot35_updatetime),
  parseTimestamp(slot35_deletetime),
  'pending',
  'pending',
  slot36,
  parseTimestamp(slot36_updatetime),
  parseTimestamp(slot36_deletetime),
  'pending',
  'pending',
  slot37,
  parseTimestamp(slot37_updatetime),
  parseTimestamp(slot37_deletetime),
  'pending',
  'pending',
  slot38,
  parseTimestamp(slot38_updatetime),
  parseTimestamp(slot38_deletetime),
  'pending',
  'pending',
  slot39,
  parseTimestamp(slot39_updatetime),
  parseTimestamp(slot39_deletetime),
  'pending',
  'pending',
  slot40,
  parseTimestamp(slot40_updatetime),
  parseTimestamp(slot40_deletetime),
  'pending',
  'pending',
  slot41,
  parseTimestamp(slot41_updatetime),
  parseTimestamp(slot41_deletetime),
  'pending',
  'pending',
  slot42,
  parseTimestamp(slot42_updatetime),
  parseTimestamp(slot42_deletetime),
  'pending',
  'pending',
  slot43,
  parseTimestamp(slot43_updatetime),
  parseTimestamp(slot43_deletetime),
  'pending',
  'pending',
  slot44,
  parseTimestamp(slot44_updatetime),
  parseTimestamp(slot44_deletetime),
  'pending',
  'pending',
  slot45,
  parseTimestamp(slot45_updatetime),
  parseTimestamp(slot45_deletetime),
  'pending',
  'pending',
  slot46,
  parseTimestamp(slot46_updatetime),
  parseTimestamp(slot46_deletetime),
  'pending',
  'pending',
  slot47,
  parseTimestamp(slot47_updatetime),
  parseTimestamp(slot47_deletetime),
  'pending',
  'pending',
  slot48,
  parseTimestamp(slot48_updatetime),
  parseTimestamp(slot48_deletetime),
  'pending',
  'pending',
  slot49,
  parseTimestamp(slot49_updatetime),
  parseTimestamp(slot49_deletetime),
  'pending',
  'pending',
  slot50,
  parseTimestamp(slot50_updatetime),
  parseTimestamp(slot50_deletetime),
  'pending',
  'pending',
  slot51,
  parseTimestamp(slot51_updatetime),
  parseTimestamp(slot51_deletetime),
  'pending',
  'pending',
  slot52,
  parseTimestamp(slot52_updatetime),
  parseTimestamp(slot52_deletetime),
  'pending',
  'pending',
  slot53,
  parseTimestamp(slot53_updatetime),
  parseTimestamp(slot53_deletetime),
  'pending',
  'pending',
  slot54,
  parseTimestamp(slot54_updatetime),
  parseTimestamp(slot54_deletetime),
  'pending',
  'pending',
  slot55,
  parseTimestamp(slot55_updatetime),
  parseTimestamp(slot55_deletetime),
  'pending',
  'pending',
  slot56,
  parseTimestamp(slot56_updatetime),
  parseTimestamp(slot56_deletetime),
  'pending',
  'pending',
  slot57,
  parseTimestamp(slot57_updatetime),
  parseTimestamp(slot57_deletetime),
  'pending',
  'pending',
  slot58,
  parseTimestamp(slot58_updatetime),
  parseTimestamp(slot58_deletetime),
  'pending',
  'pending',
  slot59,
  parseTimestamp(slot59_updatetime),
  parseTimestamp(slot59_deletetime),
  'pending',
  'pending',
  slot60,
  parseTimestamp(slot60_updatetime),
  parseTimestamp(slot60_deletetime),
  'pending',
  'pending',
  slot61,
  parseTimestamp(slot61_updatetime),
  parseTimestamp(slot61_deletetime),
  'pending',
  'pending',
  slot62,
  parseTimestamp(slot62_updatetime),
  parseTimestamp(slot62_deletetime),
  'pending',
  'pending',
  slot63,
  parseTimestamp(slot63_updatetime),
  parseTimestamp(slot63_deletetime),
  'pending',
  'pending',
  slot64,
  parseTimestamp(slot64_updatetime),
  parseTimestamp(slot64_deletetime),
  'pending',
  'pending',
  slot65,
  parseTimestamp(slot65_updatetime),
  parseTimestamp(slot65_deletetime),
  'pending',
  'pending',
  slot66,
  parseTimestamp(slot66_updatetime),
  parseTimestamp(slot66_deletetime),
  'pending',
  'pending',
  slot67,
  parseTimestamp(slot67_updatetime),
  parseTimestamp(slot67_deletetime),
  'pending',
  'pending',
  slot68,
  parseTimestamp(slot68_updatetime),
  parseTimestamp(slot68_deletetime),
  'pending',
  'pending',
  slot69,
  parseTimestamp(slot69_updatetime),
  parseTimestamp(slot69_deletetime),
  'pending',
  'pending',
  slot70,
  parseTimestamp(slot70_updatetime),
  parseTimestamp(slot70_deletetime),
  'pending',
  'pending',
  slot71,
  parseTimestamp(slot71_updatetime),
  parseTimestamp(slot71_deletetime),
  'pending',
  'pending',
  slot72,
  parseTimestamp(slot72_updatetime),
  parseTimestamp(slot72_deletetime),
  'pending',
  'pending',
  slot73,
  parseTimestamp(slot73_updatetime),
  parseTimestamp(slot73_deletetime),
  'pending',
  'pending',
  slot74,
  parseTimestamp(slot74_updatetime),
  parseTimestamp(slot74_deletetime),
  'pending',
  'pending',
  slot75,
  parseTimestamp(slot75_updatetime),
  parseTimestamp(slot75_deletetime),
  'pending',
  'pending',
  slot76,
  parseTimestamp(slot76_updatetime),
  parseTimestamp(slot76_deletetime),
  'pending',
  'pending',
  slot77,
  parseTimestamp(slot77_updatetime),
  parseTimestamp(slot77_deletetime),
  'pending',
  'pending',
  slot78,
  parseTimestamp(slot78_updatetime),
  parseTimestamp(slot78_deletetime),
  'pending',
  'pending',
  slot79,
  parseTimestamp(slot79_updatetime),
  parseTimestamp(slot79_deletetime),
  'pending',
  'pending',
  slot80,
  parseTimestamp(slot80_updatetime),
  parseTimestamp(slot80_deletetime),
  'pending',
  'pending',
  slot81,
  parseTimestamp(slot81_updatetime),
  parseTimestamp(slot81_deletetime),
  'pending',
  'pending',
  slot82,
  parseTimestamp(slot82_updatetime),
  parseTimestamp(slot82_deletetime),
  'pending',
  'pending',
  slot83,
  parseTimestamp(slot83_updatetime),
  parseTimestamp(slot83_deletetime),
  'pending',
  'pending',
  slot84,
  parseTimestamp(slot84_updatetime),
  parseTimestamp(slot84_deletetime),
  'pending',
  'pending',
  slot85,
  parseTimestamp(slot85_updatetime),
  parseTimestamp(slot85_deletetime),
  'pending',
  'pending',
  slot86,
  parseTimestamp(slot86_updatetime),
  parseTimestamp(slot86_deletetime),
  'pending',
  'pending',
  slot87,
  parseTimestamp(slot87_updatetime),
  parseTimestamp(slot87_deletetime),
  'pending',
  'pending',
  slot88,
  parseTimestamp(slot88_updatetime),
  parseTimestamp(slot88_deletetime),
  'pending',
  'pending',
  slot89,
  parseTimestamp(slot89_updatetime),
  parseTimestamp(slot89_deletetime),
  'pending',
  'pending',
  slot90,
  parseTimestamp(slot90_updatetime),
  parseTimestamp(slot90_deletetime),
  'pending',
  'pending',
  slot91,
  parseTimestamp(slot91_updatetime),
  parseTimestamp(slot91_deletetime),
  'pending',
  'pending',
  slot92,
  parseTimestamp(slot92_updatetime),
  parseTimestamp(slot92_deletetime),
  'pending',
  'pending',
  slot93,
  parseTimestamp(slot93_updatetime),
  parseTimestamp(slot93_deletetime),
  'pending',
  'pending',
  slot94,
  parseTimestamp(slot94_updatetime),
  parseTimestamp(slot94_deletetime),
  'pending',
  'pending',
  slot95,
  parseTimestamp(slot95_updatetime),
  parseTimestamp(slot95_deletetime),
  'pending',
  'pending',
  slot96,
  parseTimestamp(slot96_updatetime),
  parseTimestamp(slot96_deletetime),
  'pending',
  'pending',
  slot97,
  parseTimestamp(slot97_updatetime),
  parseTimestamp(slot97_deletetime),
  'pending',
  'pending',
  slot98,
  parseTimestamp(slot98_updatetime),
  parseTimestamp(slot98_deletetime),
  'pending',
  'pending',
  slot99,
  parseTimestamp(slot99_updatetime),
  parseTimestamp(slot99_deletetime),
  'pending',
  'pending',
  slot100,
  parseTimestamp(slot100_updatetime),
  parseTimestamp(slot100_deletetime),
  'pending',
  'pending',
  layout_1 ,
  layout_2 ,
  layout_3 ,
  layout_4 ,
  layout_5 ,
  layout_6 ,
  layout_7 ,
  layout_8 ,
  layout_9 ,
  layout_10 ,
        ]
      );
      res.send('Data inserted successfully.');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error inserting data');
    }
  };


module.exports={
    createPlaylist,viewPlaylist,updateScreensWithPlaylist,getPlaylistById,editPlaylist,deletePlaylist,deleteScreensWithPlaylist,getScreenIDsByPlaylistId,deletePlaylistById
}