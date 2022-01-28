import { createDAVClient, DAVAccount, DAVCollection, DAVObject } from "tsdav";
import { getUidFromVcard } from "../../services/vcard/vcard.service";
import { CommandContext } from "../../shared.types";

export const getVCards = async (
  context: CommandContext
): Promise<{
  account: DAVAccount;
  addressBooks: (DAVCollection & {
    vcards: { vcard: DAVObject; uid?: string }[];
  })[];
}> => {
  const {
    debug,
    config: {
      carddav: { url: serverUrl, username, password },
    },
  } = context;

  const client = await createDAVClient({
    serverUrl,
    authMethod: "Basic",
    credentials: {
      username,
      password,
    },
  });

  debug("Got client #bVoqc1");
  debug(client);

  const account = await client.createAccount({
    account: {
      serverUrl,
      accountType: "carddav",
    },
  });

  debug("Got account #ToupBB");
  debug(account);

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
        return {
          vcard,
          uid: uidResult.success ? uidResult.result : undefined,
        };
      });
      return { ...addressBook, vcards: expandedVcards };
    })
  );

  debug("Got vcards #DN3ahi");
  debug(addressBooksWithVcards);

  return {
    account,
    addressBooks: addressBooksWithVcards,
  };
};
