import { DAVAccount, DAVClient, DAVCollection, DAVObject } from "tsdav";
import { getUidFromVcard } from "../../services/vcard/vcard.service";
import { CommandContext } from "../../shared.types";

type ClientAndAccount = {
  client: DAVClient;
  account: DAVAccount;
};

export const getClientAndAccount = async (
  context: CommandContext
): Promise<ClientAndAccount> => {
  const {
    debug,
    config: {
      carddav: { url: serverUrl, authMethod, credentials },
    },
  } = context;

  const client = await new DAVClient({
    serverUrl,
    authMethod,
    credentials,
    defaultAccountType: "carddav",
  });

  client.login();

  const account = await client.createAccount({
    account: {
      serverUrl,
      accountType: "carddav",
    },
  });

  debug("Got client and account #ToupBB", client, account);

  return { client, account };
};

export const getVCards = async (
  context: CommandContext,
  { client, account }: ClientAndAccount
): Promise<
  (DAVCollection & {
    vcards: { vcard: DAVObject; uid?: string }[];
  })[]
> => {
  const { debug } = context;

  const addressBooks = await client.fetchAddressBooks({ account });

  debug("Got address books #kzx54I");
  debug(addressBooks);

  const addressBooksWithVcards = await Promise.all(
    addressBooks.map(async (addressBook) => {
      const vcards = await client.fetchVCards({
        addressBook,
      });
      const expandedVcards = vcards.map((vcard) => {
        const uidResult = getUidFromVcard(vcard.data);
        if (!uidResult.success) {
          debug(`#go9Ett Failed to find UID for vcard`, uidResult, vcard);
        }

        return {
          vcard,
          uid: uidResult.success ? uidResult.result : undefined,
        };
      });
      return { ...addressBook, vcards: expandedVcards } as const;
    })
  );

  debug(
    "Got vcards #DN3ahi",
    addressBooksWithVcards,
    addressBooksWithVcards[0].vcards
  );

  return addressBooksWithVcards;
};
