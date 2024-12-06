// here we are declaring our MessageRepository types for Repositories/MessageRepository

// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module "@ioc:Repositories/MessageRepository" {
  export interface SerializedMessage {
    createdBy: number;
    content: string;
    channelId: number;
    createdAt: string;
    updatedAt: string;
    id: number;
    mentions: number;
    author: {
      id: number;
      email: string;
      createdAt: string;
      updatedAt: string;
    };
  }

  export interface MessageRepositoryContract {
    getAll(channelName: string): Promise<SerializedMessage[]>;
    loadMessageBatch(
      channelName: string,
      index: number,
      count: number
    ): Promise<SerializedMessage[]>;
    create(
      channelName: string,
      userId: number,
      content: string,
      mentions: number
    ): Promise<SerializedMessage>;
  }

  const MessageRepository: MessageRepositoryContract;
  export default MessageRepository;
}