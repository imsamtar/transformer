let mutation = `mutation {`

let oldData = [{ "block_id": 1, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 4, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 5, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 6, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 7, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled999" }, "__typename": "transformer_pseudo_block" }];
let newData = [{ "block_id": 4, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 5, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 6, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }, { "block_id": 7, "type": "pseudo_query", "text": { "text": "Some text here", "title": "NewName" }, "__typename": "transformer_pseudo_block" }, { "block_id": 8, "type": "pseudo_query", "text": { "text": "Some text here", "title": "Untitled" }, "__typename": "transformer_pseudo_block" }];

function getMutation(oldData, newData) {

    let changed = oldData.map(old_block => {
        let found;
        if (found = newData.find(new_block => new_block.block_id === old_block.block_id)) {
            if (JSON.stringify(found) !== JSON.stringify(old_block)) {
                return {
                    old_block,
                    new_block: found
                };
            }
        }
        return false;
    }).filter(Boolean);

    const deletedBlocks = oldData.map(old_block => {
        if (!newData.find(new_block => new_block.block_id === old_block.block_id)) {
            return old_block;
        }
    }).filter(Boolean);

    deletedBlocks.forEach((old_block) => {
        mutation += `
        delete_transformer_pseudo_block_by_pk(block_id: ${old_block.block_id}){
            block_id
        }
    `;
    });

    changed.forEach(({ old_block, new_block }) => {
        mutation += `
        update_transformer_pseudo_block_by_pk(pk_columns: {block_id: ${old_block.block_id}}, _set: {text: ${stringify(new_block.text)}}){
            block_id
        }
    `;
    });

    mutation += '}'

    return mutation;

    function stringify(obj) {
        let str = '';
        for (const entry of Object.entries(obj)) {
            if (typeof obj[1] !== "object")
                str += `${entry[0]}: ${JSON.stringify(entry[1])}, `;
            else
                str += `${entry[0]}: ${stringify(entry[1])}, `;
        }
        str = str.replace(/^\s*/, '{ ')
        str = str.replace(/,\s$/, ' }');
        str = str.replace(/,\s/g, ', ');
        str = str.replace(/{\s/, '{ ');

        return str;
    }
}

console.log(getMutation(newData,oldData));
