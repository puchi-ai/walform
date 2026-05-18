module blob_index::blob_index {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use std::string::{String};
    use sui::event;
    use std::vector;

    /// Capability representing admin management rights
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Registry storing all admin addresses (shared object)
    public struct AdminRegistry has key {
        id: UID,
        admins: vector<address>,
    }

    /// Store blob metadata indexed by the user
    public struct BlobMetadata has key, store {
        id: UID,
        owner: address,
        blob_id: String,
        name: String,
        description: String,
        created_at: u64,
    }

    /// Event emitted when a blob is indexed
    public struct BlobIndexed has copy, drop {
        object_id: ID,
        owner: address,
        blob_id: String,
    }

    /// Event emitted when a blob is updated
    public struct BlobUpdated has copy, drop {
        object_id: ID,
        owner: address,
        blob_id: String,
        name: String,
        description: String,
    }

    /// Event emitted when a blob is deleted from index
    public struct BlobDeleted has copy, drop {
        object_id: ID,
        owner: address,
        blob_id: String,
    }

    /// Store response metadata indexed by the user
    public struct ResponseMetadata has key, store {
        id: UID,
        owner: address,
        form_blob_id: String,
        response_blob_id: String,
        created_at: u64,
    }

    /// Event emitted when a response is indexed
    public struct ResponseIndexed has copy, drop {
        object_id: ID,
        form_blob_id: String,
        response_blob_id: String,
    }

    /// Initialize the contract
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        // Create AdminCap and transfer to sender
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, sender);

        // Create AdminRegistry shared object, starting with sender as the first admin
        let registry = AdminRegistry {
            id: object::new(ctx),
            admins: vector[sender],
        };
        transfer::share_object(registry);
    }

    /// Add an admin address (only AdminCap holder can call)
    entry fun add_admin(
        _cap: &AdminCap,
        registry: &mut AdminRegistry,
        admin: address,
        _ctx: &mut TxContext
    ) {
        if (!vector::contains(&registry.admins, &admin)) {
            vector::push_back(&mut registry.admins, admin);
        };
    }

    /// Remove an admin address (only AdminCap holder can call)
    entry fun remove_admin(
        _cap: &AdminCap,
        registry: &mut AdminRegistry,
        admin: address,
        _ctx: &mut TxContext
    ) {
        let (found, index) = vector::index_of(&registry.admins, &admin);
        if (found) {
            vector::remove(&mut registry.admins, index);
        };
    }

    /// Register a new blob in the index
    entry fun register_blob(
        blob_id: String,
        name: String,
        description: String,
        created_at: u64,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let object_id = object::uid_to_inner(&id);
        let owner = tx_context::sender(ctx);

        let metadata = BlobMetadata {
            id,
            owner,
            blob_id,
            name,
            description,
            created_at,
        };

        event::emit(BlobIndexed {
            object_id,
            owner,
            blob_id,
        });

        transfer::transfer(metadata, owner);
    }

    /// Update an existing blob's metadata (only owner can call this because metadata is passed as &mut)
    entry fun update_blob(
        metadata: &mut BlobMetadata,
        name: String,
        description: String,
        _ctx: &mut TxContext
    ) {
        metadata.name = name;
        metadata.description = description;

        event::emit(BlobUpdated {
            object_id: object::uid_to_inner(&metadata.id),
            owner: tx_context::sender(_ctx),
            blob_id: metadata.blob_id,
            name,
            description,
        });
    }

    /// Delete an existing blob's metadata (only owner can call this because metadata is passed by value)
    entry fun delete_blob(
        metadata: BlobMetadata,
        _ctx: &mut TxContext
    ) {
        let BlobMetadata {
            id,
            owner,
            blob_id,
            name: _,
            description: _,
            created_at: _,
        } = metadata;

        event::emit(BlobDeleted {
            object_id: object::uid_to_inner(&id),
            owner,
            blob_id,
        });

        object::delete(id);
    }

    /// Register a new response for a form
    entry fun register_response(
        form_owner: address,
        form_blob_id: String,
        response_blob_id: String,
        created_at: u64,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let object_id = object::uid_to_inner(&id);

        let response = ResponseMetadata {
            id,
            owner: form_owner,
            form_blob_id,
            response_blob_id,
            created_at,
        };

        event::emit(ResponseIndexed {
            object_id,
            form_blob_id,
            response_blob_id,
        });

        transfer::transfer(response, form_owner);
    }
}
